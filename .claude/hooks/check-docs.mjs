#!/usr/bin/env node
// Used by .githooks/pre-commit: blocks a commit when a staged src/ file has no
// matching staged doc. Single source of truth for the src->docs path mapping.

import { execFileSync } from 'node:child_process'

// Depth-1 only, which is what excludes the 8 vendored shadcn files in src/components/ui/
// without needing a denylist. Pages map into docs/components/, not a docs/pages/ dir.
const MAPPINGS = [
  { dir: 'src/components', ext: '.tsx', docDir: 'docs/components' },
  { dir: 'src/pages', ext: '.tsx', docDir: 'docs/components' },
  { dir: 'src/hooks', ext: '.ts', docDir: 'docs/hooks' },
  { dir: 'src/lib', ext: '.ts', docDir: 'docs/utils' },
]

function git(args) {
  try {
    // stderr is ignored on purpose: git emits CRLF-conversion warnings on Windows that would
    // otherwise clutter the block message.
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

function isTestFile(path) {
  return /\.(test|browser\.test)\.(ts|tsx)$/.test(path)
}

/** Returns [{ source, expectedDoc }] for staged files that are in a mapped location. */
function mappedSources(files) {
  const results = []
  for (const file of files) {
    if (isTestFile(file)) continue
    for (const { dir, ext, docDir } of MAPPINGS) {
      if (!file.startsWith(`${dir}/`) || !file.endsWith(ext)) continue
      const rest = file.slice(dir.length + 1)
      if (rest.includes('/')) continue // depth-1 only
      const name = rest.slice(0, -ext.length)
      results.push({ source: file, expectedDoc: `${docDir}/${name}.md` })
      break
    }
  }
  return results
}

function main() {
  const files = git(['diff', '--cached', '--name-only'])
  const sources = mappedSources(files)
  if (sources.length === 0) return 0

  const changedSet = new Set(files)
  const missingDocs = [...new Set(
    sources.filter((s) => !changedSet.has(s.expectedDoc)).map((s) => s.expectedDoc),
  )]
  if (missingDocs.length === 0) return 0

  console.error(
    `Blocked: ${missingDocs.length} doc file(s) not updated for staged src changes:\n` +
      missingDocs.map((doc) => `  - ${doc}`).join('\n') +
      `\n\nSee .claude/skills/update-docs/SKILL.md -> "Delegating to docs-auditor"` +
      ` for how to brief the docs-auditor agent (or write them directly).`,
  )
  return 1
}

process.exit(main())
