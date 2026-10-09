#!/usr/bin/env node
// PreToolUse(Skill) gate: only the ui-designer subagent may invoke the vendored
// design skills directly. The main session must go through build-ui -> ui-designer
// instead, so the decide-vs-write split can't be bypassed by the Skill tool's own
// auto-surfaced descriptions matching a UI request before build-ui does.

import { readFileSync } from 'node:fs'

const VENDORED_DESIGN_SKILLS = new Set([
  'banner-design',
  'brand',
  'design-system',
  'design',
  'slides',
  'ui-styling',
  'ui-ux-pro-max',
  'frontend-design',
])
const ALLOWED_AGENT_TYPE = 'ui-designer'

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

let payload
try {
  payload = JSON.parse(readFileSync(0, 'utf8') || '{}')
} catch {
  allow()
}

const skillName = payload?.tool_input?.skill

if (!VENDORED_DESIGN_SKILLS.has(skillName)) allow()
if (payload?.agent_type === ALLOWED_AGENT_TYPE) allow()

deny(
  `"${skillName}" is one of the vendored design-intelligence skills, reserved for the ` +
    `ui-designer subagent. Invoke the build-ui skill instead, which spawns ui-designer to use it.`,
)
