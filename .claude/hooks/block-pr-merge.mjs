#!/usr/bin/env node
// PreToolUse(Bash) gate: Claude Code never merges a PR, full stop, regardless of target
// branch. GitHub's own ruleset on this repo requires a PR before merging into main but
// sets required_approving_review_count to 0 (a solo contributor can't require a second
// reviewer) — so nothing on GitHub's side blocks a `gh pr merge` run from this agent.
// This hook is the actual gate: merging stays a human action, done by the user in their
// own terminal or the GitHub UI, never by this agent.
//
// Covers every command-shaped route to the same outcome: the obvious `gh pr merge` (any
// flags, including --admin), the equivalent raw API call (`gh api .../merge`), and a
// direct `git push` to main/master (defense-in-depth against GitHub's ruleset rejecting
// it server-side). No bypass flag — an override defeats the point of "deterministic".
//
// Deliberately a regex/segment heuristic, not a shell parser — same tradeoff as the
// other hooks in this file: it only needs to catch the ordinary shape of these commands,
// not survive adversarial quoting.
//
// Each trigger regex is matched against a quote/heredoc-stripped copy of the segment (see
// lib/stripQuoted.mjs), so a commit message or doc edit that merely *mentions* one of these
// commands doesn't false-positive the same way a real invocation would.

import { readFileSync } from 'node:fs'
import { stripQuoted } from './lib/stripQuoted.mjs'

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

// Splits on top-level ;/&&/||. Not quote-aware -- same tradeoff as the other hooks here.
function splitSegments(command) {
  return command
    .split(/\s*(?:&&|\|\||;)\s*/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
}

const GH_PR_MERGE = /\bgh\s+pr\s+merge\b/
const GH_API_MERGE = /\bgh\s+api\b.*\/pulls\/[^\s]*\/merge\b/
const PUSH_TO_PROTECTED_BRANCH = /\bgit\s+push\b.*\b(?:refs\/heads\/)?(?:main|master)\b/

let payload
try {
  payload = JSON.parse(readFileSync(0, 'utf8') || '{}')
} catch {
  allow()
}

const command = payload?.tool_input?.command ?? ''
const segments = splitSegments(command)

for (const segment of segments) {
  const stripped = stripQuoted(segment)

  if (GH_PR_MERGE.test(stripped)) {
    deny(
      `"${segment}" merges a PR. Merging is a human action in this repo — ask the user to run ` +
        `this themselves (in their own terminal or the GitHub UI) instead of running it for them.`,
    )
  }
  if (GH_API_MERGE.test(stripped)) {
    deny(
      `"${segment}" hits a PR merge endpoint directly. Same rule as "gh pr merge" — merging is a ` +
        `human action; ask the user to do it themselves instead.`,
    )
  }
  if (PUSH_TO_PROTECTED_BRANCH.test(stripped)) {
    deny(
      `"${segment}" pushes directly to a protected branch (main/master), which is equivalent to ` +
        `merging without a PR review. Ask the user to do this themselves instead.`,
    )
  }
}

allow()
