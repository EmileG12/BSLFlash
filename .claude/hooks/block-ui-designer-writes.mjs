#!/usr/bin/env node
// PreToolUse(Bash) gate: the ui-designer subagent has no Edit/Write tools, but Bash
// alone can still write files by other means (redirects, sed -i, cp/mv/tee/rm, or the
// write-capable commands this skill set already names elsewhere: shadcn_add.py,
// ui-ux-pro-max's --persist/--force). This closes that gap structurally rather than
// relying on ui-designer's own instructions to refrain.
//
// No-op for the main session and every other subagent -- only agent_type ===
// 'ui-designer' is checked here at all.

import { readFileSync } from 'node:fs'

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

// Splits on top-level ;/&&/||. Not quote-aware -- same tradeoff as
// require-test-redirect.mjs, acceptable for this heuristic.
function splitSegments(command) {
  return command
    .split(/\s*(?:&&|\|\||;)\s*/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
}

function hasFileRedirect(segment) {
  const re = />+\s*(\S+)/g
  let match
  while ((match = re.exec(segment))) {
    // Excludes fd-duplication redirects like the `&1` in `2>&1`, which match the same
    // `>` but aren't a file path.
    if (!match[1].startsWith('&')) return true
  }
  return false
}

const WRITE_CAPABLE_PATTERNS = [
  /\bsed\s+(-[a-zA-Z]*i|--in-place)\b/, // sed -i / --in-place
  /\b(cp|mv|tee|rm)\b/, // file management commands
  /\bshadcn_add\.py\b/, // this skill set's own write-capable script
  /--persist\b/, // ui-ux-pro-max: writes design-system/<slug>/MASTER.md
  /--force\b/, // ui-ux-pro-max/tailwind_config_gen.py: overwrite guard bypass
]

let payload
try {
  payload = JSON.parse(readFileSync(0, 'utf8') || '{}')
} catch {
  allow()
}

if (payload?.agent_type !== 'ui-designer') allow()

const command = payload?.tool_input?.command ?? ''
const segments = splitSegments(command)

for (const segment of segments) {
  if (hasFileRedirect(segment)) {
    deny(
      `"${segment}" redirects to a file. ui-designer is read-only -- report what should change ` +
        `in your spec and let the caller (build-ui) make the edit.`,
    )
  }
  const writePattern = WRITE_CAPABLE_PATTERNS.find((pattern) => pattern.test(segment))
  if (writePattern) {
    deny(
      `"${segment}" matches a write-capable command (${writePattern}). ui-designer decides and ` +
        `reports -- recommend this in your spec instead of running it; the caller runs it during ` +
        `implementation.`,
    )
  }
}

allow()
