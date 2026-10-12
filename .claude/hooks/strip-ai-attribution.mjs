#!/usr/bin/env node
// Used by .githooks/commit-msg: this repo's CLAUDE.md bans AI-attribution lines
// (Co-Authored-By: Claude..., "Generated with Claude Code") from commits and PRs,
// overriding the harness's default attribution reminder. Agents don't always catch
// that override themselves, so this strips the lines as a backstop rather than
// relying on every agent remembering to omit them.

import { readFileSync, writeFileSync } from 'node:fs'

const path = process.argv[2]
if (!path) {
  console.error('strip-ai-attribution: no commit-msg file path given')
  process.exit(1)
}

const ATTRIBUTION_LINE = /^(co-authored-by:.*claude.*|.*generated with.*claude code.*)$/i

const original = readFileSync(path, 'utf8')
const lines = original.split('\n')
const kept = lines.filter((line) => !ATTRIBUTION_LINE.test(line.trim()))

// Collapse any blank line(s) left behind right at the end of the message (trailing
// newline aside), so stripping a trailer doesn't leave a dangling empty line.
while (kept.length > 1 && kept[kept.length - 2] === '' && kept[kept.length - 1] === '') {
  kept.pop()
}

const result = kept.join('\n')
if (result !== original) {
  writeFileSync(path, result)
}
