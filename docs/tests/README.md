# Tests

What the test suite covers, one doc file per test file. Kept as its own category, separate from `docs/components/`, `docs/hooks/`, `docs/utils/`, so test docs don't flood the docs for the actual codebase — each entry links back to the doc of the thing it tests.

## Two suites

Tests are split into two Vitest projects, routed by filename (configured under `test.projects` in `vite.config.ts`):

| Suite | Files | Environment | Command |
|---|---|---|---|
| `unit` | `Foo.test.tsx` | jsdom, in-memory | `npm run test` |
| `browser` | `Foo.browser.test.tsx` | real Chromium via Playwright | `npx vitest run --project=browser` |

`npm run test` runs **only** the `unit` project, so day-to-day changes never pay the browser cost. Browser tests are for behavior jsdom genuinely cannot simulate — anything depending on layout, hit-testing, or real pointer input. Everything else belongs in the fast suite. Browser tests drive input with `userEvent` from `vitest/browser` (Playwright's real input driver), not `@testing-library/user-event`; see [NavBar.browser](./NavBar.browser.md) for why that distinction matters.

Browser tests are type-checked as their own TypeScript project (`tsconfig.browser-test.json`) because Vitest's browser matcher types conflict with jest-dom's — `tsconfig.app.json` excludes them.

Running the browser suite requires Chromium: `npx playwright install chromium`.

## Test files

| Test file | Tests | Covers |
|---|---|---|
| [LoginPage](./LoginPage.md) | `src/pages/LoginPage.test.tsx` | [LoginPage](../components/LoginPage.md) |
| [SignupPage](./SignupPage.md) | `src/pages/SignupPage.test.tsx` | [SignupPage](../components/SignupPage.md) |
| [NavBar](./NavBar.md) | `src/components/NavBar.test.tsx` | [NavBar](../components/NavBar.md) |
| [NavBar.browser](./NavBar.browser.md) | `src/components/NavBar.browser.test.tsx` | [NavBar](../components/NavBar.md) — real-browser click behavior |
| [SelectDeckCard](./SelectDeckCard.md) | `src/components/SelectDeckCard.test.tsx` | [SelectDeckCard](../components/SelectDeckCard.md) |
| [HomePage](./HomePage.md) | `src/pages/HomePage.test.tsx` | [HomePage](../components/HomePage.md) |
| [useWords](./useWords.md) | `src/hooks/useWords.test.ts` | [useWords](../hooks/useWords.md) |
| [useRandomFlashcard](./useRandomFlashcard.md) | `src/hooks/useRandomFlashcard.test.ts` | [useRandomFlashcard](../hooks/useRandomFlashcard.md) |
| [WordGuessCombobox](./WordGuessCombobox.md) | `src/components/WordGuessCombobox.test.tsx` | [WordGuessCombobox](../components/WordGuessCombobox.md) |
| [FlashcardPage](./FlashcardPage.md) | `src/pages/FlashcardPage.test.tsx` | [FlashcardPage](../components/FlashcardPage.md) |
| [FlashcardRound](./FlashcardRound.md) | `src/components/FlashcardRound.test.tsx` | [FlashcardRound](../components/FlashcardRound.md) |
| [useTenCardsRound](./useTenCardsRound.md) | `src/hooks/useTenCardsRound.test.ts` | [useTenCardsRound](../hooks/useTenCardsRound.md) |
| [ModeSelectPage](./ModeSelectPage.md) | `src/pages/ModeSelectPage.test.tsx` | [ModeSelectPage](../components/ModeSelectPage.md) |
| [TenCardsPage](./TenCardsPage.md) | `src/pages/TenCardsPage.test.tsx` | [TenCardsPage](../components/TenCardsPage.md) |

## Shared helpers

| Helper | Path | Purpose |
|---|---|---|
| [mockCategories](./mockCategories.md) | `src/test/mockCategories.ts` | Stubs the Supabase query chain behind `useCategories`. |
