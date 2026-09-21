---
name: suggest-tests
description: Use after making any code change to a React component, hook, or utility function — suggests whether new Vitest/React Testing Library tests are warranted, and which existing test files are relevant to re-run to check for regressions.
---

# Suggest tests

This project uses [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react), split into two suites routed by filename (see [`docs/tests/README.md`](../../../docs/tests/README.md)):

| Suite | Files | Environment | Command |
|---|---|---|---|
| `unit` | `Foo.test.tsx` | jsdom, in-memory | `npm run test` |
| `browser` | `Foo.browser.test.tsx` | real Chromium via Playwright | `npx vitest run --project=browser` |

**`npm run test` runs only the `unit` suite.** It is not a full-suite run — if the change touches something with browser tests, run the browser project too or say plainly that you didn't.

Conventions already established (follow them, don't reinvent per file):
- Test files live next to the code they test (`Foo.tsx` -> `Foo.test.tsx`, or `Foo.browser.test.tsx` for the browser suite).
- Tests mock `src/lib/*` boundary modules (e.g. `vi.mock('../lib/auth', () => ({ ... }))` with an explicit factory) rather than the Supabase client itself — this is why data/auth logic gets extracted into its own file per the build workflow rules: it gives tests a clean mock boundary instead of needing a real Supabase instance.
- Navigation is tested by rendering real routes (`MemoryRouter` + `Routes`) and asserting on what ends up on screen, not by mocking `useNavigate` — tests behavior, not implementation.
- `src/test/setup.ts` wires `afterEach(cleanup)` explicitly (globals are off) and imports `@testing-library/jest-dom/vitest` for matchers like `toBeInTheDocument`.

## Checklist

0. **Check whether `src/` changed at all first.** If the change is backend-only (`supabase/migrations/`, `supabase/seed.sql`, `supabase/config.toml`, `scripts/`, etc. — no files under `src/`), this skill doesn't apply: there's no React component/hook/utility for Vitest/RTL to test, and running `npm run build`/`npm run lint`/`npm run test` against unchanged frontend code proves nothing about the change just made. Skip straight to backend-appropriate verification instead (SQL queries, curl against the local API, RLS checks) and don't run any of steps 1-5.
1. List what changed in this task: components, hooks, utility functions added/modified/removed.
2. For each one with user-visible or branching behavior (conditionals, error handling, state transitions, async calls) — not pure styling/markup-only changes — check whether a matching test file exists.
   - Missing and the change introduces real behavior worth protecting: propose specific test cases (not just "renders without crashing") and write them as part of finishing the change, same as `update-docs` does for documentation.
   - Exists already: check whether it still covers the changed behavior; add cases if not.
   - **Which suite?** Default to `unit`. Only put a test in `browser` when jsdom genuinely cannot express the behavior — it has no layout engine and no hit-testing, so anything depending on element geometry, `pointer-events` suppressing a click, or real pointer/scroll input needs a real browser. "It's a UI interaction" is not sufficient reason; most are fine in jsdom. When both apply, cover the logic in `unit` and keep the `browser` file to the browser-only sliver.
3. Identify which existing test files are affected by the change (e.g. editing a shared module like `src/lib/auth.ts` affects every test file that mocks it) and run the relevant ones. `npm run test` runs the whole `unit` suite — cheap enough to just run all of it while the suite stays small — but it does **not** run the browser suite; run `npx vitest run --project=browser` as well when the change touches something a browser test covers.
4. Skip suggesting *new* tests for pure CSS/styling changes, trivial prop renames, or config-only changes with no behavior to protect — and for the same reason, skip *running* `npm run test` for them too. `build`/`lint` are still worth running (a typo in a className string or a bad JSX edit is a real failure mode those catch), but if nothing in the change touches logic, conditionals, or data flow, no existing test can possibly be affected by it, and running the suite anyway is pure overhead. Only run tests when the change could plausibly alter something a test actually asserts on (behavior, not appearance).
5. **Document new/changed test files** under `docs/tests/<Name>.md` (kept as its own category, separate from `docs/components/`, `docs/hooks/`, `docs/utils/`, so test docs don't flood the docs for the actual codebase). Each entry: the test file's path, which **suite** it belongs to and how to run it, what it covers (its actual test cases, in prose), and a link back to the doc of the thing it tests (e.g. `[LoginPage](../components/LoginPage.md)`). Browser tests are documented as `docs/tests/<Name>.browser.md`, and should state why the behavior needs a real browser. Update `docs/tests/README.md`'s index too. This follows the same "describes current state, edited in place" rule as the rest of `/docs`.
