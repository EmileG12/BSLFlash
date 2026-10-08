#!/usr/bin/env node
// Regression test for the workflow enforcement hooks. Run: npm run test-hooks
//
// The hooks are deterministic scripts, so they don't need a behavioural test — they need a
// *wiring* test, because every way they break is silent:
//
//   - core.hooksPath unset (a fresh clone, or `npm install --ignore-scripts`): the hook
//     scripts sit in .githooks/ with nothing pointing at them, so they never run
//   - core.hooksPath pointing elsewhere, so .githooks/pre-commit is ignored entirely
//   - the src->docs path mapping going stale (a renamed docs/ dir, a new src/ subdir)
//
// Asserts observable behaviour rather than config values, so it stays true however the
// wiring changes.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

let failures = 0

function run(cmd, args, { allowFail = false, input } = {}) {
  try {
    return {
      ok: true,
      out: execFileSync(cmd, args, {
        encoding: 'utf8',
        stdio: input === undefined ? ['ignore', 'pipe', 'pipe'] : ['pipe', 'pipe', 'pipe'],
        input,
      }),
    }
  } catch (error) {
    if (!allowFail) throw error
    return { ok: false, out: `${error.stdout ?? ''}${error.stderr ?? ''}` }
  }
}

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ok   ${label}`)
  } else {
    failures += 1
    console.log(`  FAIL ${label}${detail ? `\n       ${detail}` : ''}`)
  }
}

function describe(name, fn) {
  console.log(`\n${name}`)
  fn()
}

const headBefore = run('git', ['rev-parse', 'HEAD']).out.trim()
const treeBefore = run('git', ['status', '--porcelain']).out.trim()

describe('wiring (the silent failure modes)', () => {
  const hooksPath = run('git', ['config', 'core.hooksPath'], { allowFail: true })
  const configured = hooksPath.ok && hooksPath.out.trim().length > 0
  check(
    'core.hooksPath is set',
    configured,
    'Run: npm run setup-hooks — a fresh clone has the hook scripts but not the pointer, ' +
      'so git looks in .git/hooks/ and the gate never fires.',
  )
  check(
    'it points at a directory that exists',
    configured && existsSync(hooksPath.out.trim()),
    configured ? `core.hooksPath=${hooksPath.out.trim()} but that path is missing` : '',
  )
  check('.githooks/pre-commit exists', existsSync('.githooks/pre-commit'))
  check('.claude/hooks/check-docs.mjs exists', existsSync('.claude/hooks/check-docs.mjs'))
  check(
    '.claude/hooks/require-test-redirect.mjs exists',
    existsSync('.claude/hooks/require-test-redirect.mjs'),
  )
})

// The docs gate, called the same way the pre-commit hook calls it, so a stale path
// mapping fails here.
//
// Uses temporary NEW files, fully staged. Two traps here, both of which silently make a
// working hook look broken:
//   - `git add --intent-to-add` does NOT appear in `git diff --cached --name-only` (the index
//     entry is a placeholder, not staged content), so the gate sees an empty change set
//   - `--intent-to-add` is a no-op on an already-tracked unmodified file
// Temp files also keep the test independent of which real source files exist today.
function withStagedProbes(paths, assertions) {
  try {
    for (const path of paths) {
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, '// temporary probe file created by npm run test-hooks\n')
      run('git', ['add', path], { allowFail: true })
    }
    assertions(run('node', ['.claude/hooks/check-docs.mjs'], { allowFail: true }))
  } finally {
    for (const path of paths) {
      run('git', ['reset', '--quiet', '--', path], { allowFail: true })
      rmSync(path, { force: true })
    }
  }
}

describe('docs gate: staged src without its doc is rejected', () => {
  withStagedProbes(['src/hooks/useProbeTmp.ts'], (result) => {
    check('exits non-zero', !result.ok)
    check(
      'names the expected doc',
      result.out.includes('docs/hooks/useProbeTmp.md'),
      `got: ${result.out.trim().split('\n')[0] || '(no output)'}`,
    )
    check(
      'routes to the delegation procedure',
      result.out.includes('update-docs'),
      'the block message is the only channel back to the agent — it must say where to look',
    )
  })
})

describe('docs gate: pages map into docs/components/', () => {
  withStagedProbes(['src/pages/ProbeTmpPage.tsx'], (result) => {
    check(
      'expects docs/components/ProbeTmpPage.md, not docs/pages/',
      !result.ok && result.out.includes('docs/components/ProbeTmpPage.md'),
      `got: ${result.out.trim() || '(no output)'}`,
    )
  })
})

describe('docs gate: vendored and test files are exempt', () => {
  withStagedProbes(
    ['src/components/ui/probeTmp.tsx', 'src/components/ProbeTmp.test.tsx'],
    (result) => {
      check('exits zero', result.ok, 'a false positive here trains everyone to ignore the gate')
    },
  )
})

describe('test-output gate', () => {
  const gate = (command) =>
    run('node', ['.claude/hooks/require-test-redirect.mjs'], {
      input: JSON.stringify({ tool_name: 'Bash', tool_input: { command } }),
    }).out

  const denied = gate('npm run test')
  check('denies an unredirected run', denied.includes('"permissionDecision":"deny"'))
  check(
    'hands over a usable replacement command',
    denied.includes('> .test-logs/test-run.txt') && denied.includes('tail -6'),
    'the denial message is the only place this workflow is taught at the point of use',
  )
  check('allows a redirected run', gate('npm run test > .test-logs/x.txt 2>&1').trim() === '')
  check('ignores unrelated commands', gate('git status').trim() === '')

  const wrongDir = gate('npm run test > /tmp/x.txt 2>&1; tail -6 /tmp/x.txt')
  check(
    'denies a redirect outside .test-logs/',
    wrongDir.includes('"permissionDecision":"deny"') && wrongDir.includes('.test-logs/'),
    'self-redirecting to an arbitrary path must not silently satisfy the gate',
  )

  const uncappedTail = gate('npm run test > .test-logs/x.txt 2>&1; tail -n 100 .test-logs/x.txt')
  check(
    'denies an uncapped tail after a valid redirect',
    uncappedTail.includes('"permissionDecision":"deny"'),
    'a short log makes tail -n 100 dump everything anyway, same failure mode as not redirecting',
  )

  check(
    'allows a capped tail after a valid redirect',
    gate('npm run test > .test-logs/x.txt 2>&1; tail -6 .test-logs/x.txt').trim() === '',
  )
  check(
    'allows grep after a valid redirect',
    gate('npm run test > .test-logs/x.txt 2>&1; grep FAIL .test-logs/x.txt').trim() === '',
  )

  const catted = gate('npm run test > .test-logs/x.txt 2>&1; cat .test-logs/x.txt')
  check(
    'denies cat-ing the log after a valid redirect',
    catted.includes('"permissionDecision":"deny"'),
  )
})

describe('left the repo as it found it', () => {
  check('HEAD unchanged', run('git', ['rev-parse', 'HEAD']).out.trim() === headBefore)
  check(
    'working tree unchanged',
    run('git', ['status', '--porcelain']).out.trim() === treeBefore,
    'this script stages and unstages paths; a mismatch means cleanup failed',
  )
})

console.log(
  failures === 0
    ? '\nAll hook checks passed.\n'
    : `\n${failures} hook check(s) FAILED — enforcement may be silently inactive.\n`,
)
process.exit(failures === 0 ? 0 : 1)
