---
name: run-tests
description: ALWAYS use this skill whenever running any test command in this repo, or deciding which command/suite to run. Owns command selection (unit vs browser, --changed vs full) and the mandatory redirect-and-bounded-peek workflow for capturing and reading output — never deviate, never read unredirected or unbounded test output.
---

# Run tests

This skill owns **which command to run** and **how its output is captured and read**. It does not decide whether new tests are needed, what cases to write, or where a new test file belongs — that's [`suggest-tests`](../suggest-tests/SKILL.md), used after development ends. Once a task has identified which files/suite are relevant, this skill takes over for execution.

## Picking the command

Two suites, routed by filename:

| Suite | Files | Environment | Command |
|---|---|---|---|
| `unit` | `Foo.test.tsx` | jsdom, in-memory | `npm run test` |
| `browser` | `Foo.browser.test.tsx` | real Chromium via Playwright | `npx vitest run --project=browser` |

**`npm run test` runs only the `unit` suite.** It is not a full-suite run — if the change touches something with browser tests, run the browser project too, or say plainly that you didn't.

**Default to `--changed`, not the full suite.** For an in-progress edit, run `npx vitest run --project=unit --changed` instead of `npm run test` — it diffs against git and runs only the test files whose import graph (including CSS imports) actually touches what changed, which costs far fewer tokens than a full-suite run and is more precise than manually guessing "these files seem related" (a guess has previously missed real breakage from a markup/class-rename change that "felt" cosmetic). Reserve a full `npm run test` for a large multi-file feature/page addition, or as the pre-commit gate — not for routine edits.

## The rule: redirect, then a bounded peek

**ALWAYS** redirect test output to a file under `.test-logs/`, then read it with a bounded peek. **NEVER** let raw test output stream into the conversation, and **NEVER** read the full log once it's on disk — not even "just this once" for a short run.

This is not a style preference: it is enforced by the `PreToolUse` hook at [`.claude/hooks/require-test-redirect.mjs`](../../hooks/require-test-redirect.mjs), which denies:
- any `npm run test` / `npx vitest` / `vitest` invocation that isn't redirected to a file,
- a redirect to anywhere other than `.test-logs/` (self-redirecting to `/tmp` or elsewhere does not satisfy the gate, it's just a different way of defeating it),
- anything chained after the redirect that isn't a bounded peek: `tail -N` with `N <= 20`, `grep`, `sed -n`, or `wc`. An uncapped `tail -n 100` or a `cat` of the log is denied even though the run itself was redirected, because a short log makes either one dump everything anyway.

The hook is a fallback safety net for when this skill's rule wasn't followed — it is not the mechanism you're supposed to be relying on. Don't skip following this section because "the hook will catch it anyway": by the time it denies something, you've already picked the wrong command once. **If it denies a command anyway, that's the workflow working correctly, not an obstacle to route around.** Use the exact corrected command it hands back. Do not:
- redirect to a path outside `.test-logs/` to see if the gate notices,
- follow a valid redirect with `cat`/an uncapped `tail` because "it's a short run anyway",
- pre-empt the hook by writing the "correct-looking" command yourself without ever letting a bare command hit the gate — the gate is the enforcement mechanism, not a formatting reminder to imitate from memory.

## The canonical command

```sh
mkdir -p .test-logs && npm run test > .test-logs/test-run.txt 2>&1; tail -6 .test-logs/test-run.txt
```

Swap `npm run test` for whichever command the section above decided on (e.g. `npx vitest run --project=unit --changed`, or `npx vitest run --project=browser`) — only the left-hand side of the redirect changes.

## Drilling into a failure

Don't re-run the suite to see more — slice the log that's already on disk:

| Question | Command |
|---|---|
| How bad is it? | `tail -6 .test-logs/test-run.txt` |
| Which tests failed? | `grep "FAIL" .test-logs/test-run.txt` |
| Full detail on one | `sed -n '/FAIL.*<Name>/,/^⎯/p' .test-logs/test-run.txt` |
| Re-run just one test | `npx vitest run -t "<test name>" > .test-logs/one.txt 2>&1; tail -6 .test-logs/one.txt` |

See [`docs/tests/reading-test-output.md`](../../../docs/tests/reading-test-output.md) for how to read the anatomy of a failure block once you've isolated it, and how to tell a real regression from a stale assertion.
