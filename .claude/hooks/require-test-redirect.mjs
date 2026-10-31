#!/usr/bin/env node
// PreToolUse(Bash) gate: refuses a test run whose output is not redirected to a file
// under .test-logs/, AND refuses any command chained after that run which isn't a
// bounded peek at the resulting log (tail -N<=20 / grep / sed -n / wc).
//
// Why a gate rather than a reminder: a turn-end reminder would arrive after the mistake.
// Denying here is the only placement where the corrected command can be handed over
// *before* hundreds of lines of failure output land in context. The denial message is
// therefore the carrier for the log-file workflow (see docs/tests/reading-test-output.md).
//
// This is deliberately a regex/segment heuristic, not a shell parser -- it can be fooled
// by adversarial quoting, but it only needs to catch the ordinary ways this mistake
// actually happens (self-redirecting to an arbitrary path, then `tail -n 100` or `cat`-ing
// a short log so the whole thing lands in context anyway).
//
// TEST_INVOCATION is matched against a quote/heredoc-stripped copy of each segment (see
// lib/stripQuoted.mjs), so a commit message or doc edit that merely *mentions* e.g. "npm
// run test" doesn't false-positive the same way a real invocation would.

import { readFileSync } from 'node:fs'
import { stripQuoted } from './lib/stripQuoted.mjs'

const TEST_INVOCATION = /\b(npm\s+(run\s+)?test|npx\s+vitest|vitest)\b/
const REQUIRED_LOG_DIR = '.test-logs/'
const MAX_TAIL_LINES = 20

function allow() {
  process.exit(0)
}

function deny(reason) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }),
  )
  process.exit(0)
}

const REDIRECT_HELP =
  'Use instead:\n' +
  '  mkdir -p .test-logs && npm run test > .test-logs/test-run.txt 2>&1; tail -6 .test-logs/test-run.txt\n\n' +
  'Then drill into the log rather than re-running:\n' +
  '  grep "FAIL" .test-logs/test-run.txt        # one line per failing test\n' +
  '  sed -n \'/FAIL.*<Name>/,/^⎯/p\' .test-logs/test-run.txt   # full block for one failure\n\n' +
  'See docs/tests/reading-test-output.md for how to read a Vitest failure block.'

// Splits on top-level ;/&&/||. Not quote-aware -- acceptable for this heuristic since
// none of grep/sed/tail's expected usage here needs those separators inside quotes.
function splitSegments(command) {
  return command
    .split(/\s*(?:&&|\|\||;)\s*/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
}

function extractRedirectTargets(segment) {
  const targets = []
  const re = />+\s*(\S+)/g
  let match
  while ((match = re.exec(segment))) {
    // Excludes fd-duplication redirects like the `&1` in `2>&1`, which match the
    // same `>` but aren't a file path.
    if (!match[1].startsWith('&')) targets.push(match[1])
  }
  return targets
}

function tailLineCount(segment) {
  const match = segment.match(/^tail\s+(?:-n\s*-?(\d+)|-(\d+))\s+\S+$/)
  if (!match) return undefined
  return Number(match[1] ?? match[2])
}

function isSafeLogPeek(segment) {
  if (/^tail\s+\S+$/.test(segment)) return true // bare `tail file` defaults to 10 lines
  const lines = tailLineCount(segment)
  if (lines !== undefined) return lines <= MAX_TAIL_LINES
  if (/^grep\b/.test(segment)) return true
  if (/^sed\s+-n\b/.test(segment)) return true
  if (/^wc\b/.test(segment)) return true
  return false
}

let payload
try {
  payload = JSON.parse(readFileSync(0, 'utf8') || '{}')
} catch {
  allow()
}

const command = payload?.tool_input?.command ?? ''
const segments = splitSegments(command)
const testSegmentIndex = segments.findIndex((segment) =>
  TEST_INVOCATION.test(stripQuoted(segment)),
)

if (testSegmentIndex === -1) {
  allow()
}

const testSegment = segments[testSegmentIndex]
const targets = extractRedirectTargets(testSegment)

if (targets.length === 0) {
  deny(
    'Test output must be redirected to a file, not streamed into context. A large failure ' +
      'cascade is ~20 lines per failing test, so an unredirected run can dump hundreds of ' +
      `lines.\n\n${REDIRECT_HELP}`,
  )
}

if (!targets.some((target) => target.startsWith(REQUIRED_LOG_DIR))) {
  deny(
    `Test output must be redirected into ${REQUIRED_LOG_DIR} (found: ${targets.join(', ')}), ` +
      `not an arbitrary path -- that's the convention the rest of the workflow (grep/sed slicing, ` +
      `.gitignore) assumes.\n\n${REDIRECT_HELP}`,
  )
}

const trailingSegments = segments.slice(testSegmentIndex + 1)
const unsafeTrailing = trailingSegments.find((segment) => !isSafeLogPeek(segment))

if (unsafeTrailing) {
  deny(
    `"${unsafeTrailing}" would print unbounded log content into context instead of a bounded ` +
      `peek. After the redirect, only tail -N (N <= ${MAX_TAIL_LINES}), grep, sed -n, or wc are ` +
      `allowed -- a short log makes even "tail -n 100" or "cat" dump everything.\n\n${REDIRECT_HELP}`,
  )
}

allow()
