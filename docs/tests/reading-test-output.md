# Reading Vitest output

How to read a failure block, and how to get at one cheaply.

## Getting the output without drowning in it

A **passing** full-suite run prints about 14 lines regardless of test count — Vitest's reporter only expands on failure. A **failing** test adds roughly 20 lines each, so 20 failures is ~400 lines. That is why test runs are redirected to a file and read in slices rather than streamed (a `PreToolUse` hook enforces this; its denial message hands over the right command):

```sh
mkdir -p .test-logs
npm run test > .test-logs/test-run.txt 2>&1; tail -6 .test-logs/test-run.txt
```

Then slice the log instead of re-running:

| Question | Command |
|---|---|
| How bad is it? | `tail -6 .test-logs/test-run.txt` |
| Which tests failed? | `grep "FAIL" .test-logs/test-run.txt` |
| Full detail on one | `sed -n '/FAIL.*ScorePill/,/^⎯/p' .test-logs/test-run.txt` |
| Re-run just one test | `npx vitest run -t "renders a Score pill" > .test-logs/one.txt 2>&1` |

`-t` matches against the full test name (the `describe` + `it` strings joined), so it accepts a substring of either.

## Anatomy of a failure block

A real one from this project:

```
 FAIL  |unit| src/components/ScorePill.test.tsx > ScorePill > renders "Round: x/N | Score: y/N" when a round is given
AssertionError: expected 'Round:3/10Score:2/10' to be 'Round: 3/10 | Score: 2/10' // Object.is equality

Expected: "Round: 3/10 | Score: 2/10"
Received: "Round:3/10Score:2/10"

 ❯ src/components/ScorePill.test.tsx:21:33
     19|     const { container } = render(<ScorePill score={2} round={{ current…
     20|
     21|     expect(pillText(container)).toBe('Round: 3/10 | Score: 2/10')
       |                                 ^
     22|   })
     23| })
```

Line by line:

- **`|unit|`** — which Vitest project ran it. This repo has two (`unit` in jsdom, `browser` in real Chromium), so this tells you which environment the failure happened in. A failure only in `browser` usually means something layout- or hit-testing-related.
- **`src/.../ScorePill.test.tsx > ScorePill > renders "..."`** — the `>` chain is the nesting: file, then each enclosing `describe`, then the `it`. Copy any trailing portion of it into `-t` to isolate that test.
- **`AssertionError: expected X to be Y`** — `expected` is what your code produced; `to be` is what the test demanded. Easy to read backwards under pressure.
- **`// Object.is equality`** — the comparison used. `.toBe()` uses `Object.is`, so two structurally identical objects or arrays fail it (different references). If you see this on objects, you probably wanted `.toEqual()`. On strings and numbers it means exactly what it looks like.
- **`Expected:` / `Received:`** — the same values again, quoted and on their own lines. This is where whitespace differences become visible; `'Round:3/10Score:2/10'` vs `'Round: 3/10 | Score: 2/10'` is obvious here and nearly invisible in the one-line form above.
- **`❯ src/components/ScorePill.test.tsx:21:33`** — the frame that failed, `file:line:column`. The `❯` marks the innermost frame; if there are several stacked, the top one is where the throw happened and the rest are callers.
- **The numbered excerpt with `^`** — source around that line, with the caret under the failing column. The caret points at the *assertion*, not the bug — the bug is usually in the component under test or in the expectation itself.

## The judgment call this output cannot make for you

> Is this a real regression, or an assertion that needs to catch up?

Both look identical in the output. The example above was the **second** kind: the component's markup had deliberately changed (flex gaps replaced literal spaces and a `|` character), so `textContent` legitimately no longer contained those characters. The correct fix was updating the assertion. Had the fix instead been "restore the old markup", a deliberate redesign would have been silently reverted.

How to tell them apart:

1. **Did you intend to change this behaviour in this edit?** If yes, and the new behaviour is what you wanted, the assertion is stale. If you did not touch anything that should affect it, suspect a regression.
2. **Is the `Received` value correct-but-different, or actually wrong?** `'Round:3/10Score:2/10'` is correct content with different whitespace. A received value of `'Round:undefined/10'` would be a real bug.
3. **Does the assertion test behaviour or incidental shape?** An assertion on exact `textContent` is brittle — it breaks on markup changes that users never notice. Breaking frequently is itself a signal the assertion was testing the wrong thing.

When the answer is "assertion is stale", update it *and* consider whether it should assert something less brittle. When the answer is "regression", fix the source and leave the test alone — a test you weaken to get green is worse than no test, because it still looks like coverage.

## Related

- [tests/README.md](./README.md) — the two-suite split and how to run each.
- [`suggest-tests`](../../.claude/skills/suggest-tests/SKILL.md) — deciding whether new tests are warranted and which to run.
