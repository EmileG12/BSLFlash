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

## Reading the output

[reading-test-output.md](./reading-test-output.md) — anatomy of a Vitest failure block, how to slice a log cheaply, and how to tell a real regression from an assertion that needs updating.

## Test files

| Test file | Tests | Covers |
|---|---|---|
| [LoginPage](./LoginPage.md) | `src/pages/LoginPage.test.tsx` | [LoginPage](../components/LoginPage.md) |
| [SignupPage](./SignupPage.md) | `src/pages/SignupPage.test.tsx` | [SignupPage](../components/SignupPage.md) |
| [NavBar](./NavBar.md) | `src/components/NavBar.test.tsx` | [NavBar](../components/NavBar.md) |
| [NavBar.browser](./NavBar.browser.md) | `src/components/NavBar.browser.test.tsx` | [NavBar](../components/NavBar.md) — real-browser click behavior |
| [MobileNavSheet](./MobileNavSheet.md) | `src/components/MobileNavSheet.test.tsx` | [MobileNavSheet](../components/MobileNavSheet.md) |
| [AdminRoute](./AdminRoute.md) | `src/components/AdminRoute.test.tsx` | [AdminRoute](../components/AdminRoute.md) |
| [SuperadminRoute](./SuperadminRoute.md) | `src/components/SuperadminRoute.test.tsx` | [SuperadminRoute](../components/SuperadminRoute.md) |
| [SelectDeckCard](./SelectDeckCard.md) | `src/components/SelectDeckCard.test.tsx` | [SelectDeckCard](../components/SelectDeckCard.md) |
| [DeckGrid](./DeckGrid.md) | `src/components/DeckGrid.test.tsx` | [DeckGrid](../components/DeckGrid.md) |
| [MyDecksPage](./MyDecksPage.md) | `src/pages/MyDecksPage.test.tsx` | [MyDecksPage](../components/MyDecksPage.md) |
| [EditDeckModal](./EditDeckModal.md) | `src/components/EditDeckModal.test.tsx` | [EditDeckModal](../components/EditDeckModal.md) |
| [BrowseDecksPage](./BrowseDecksPage.md) | `src/pages/BrowseDecksPage.test.tsx` | [BrowseDecksPage](../components/BrowseDecksPage.md) |
| [TagFilterChips](./TagFilterChips.md) | `src/components/TagFilterChips.test.tsx` | [TagFilterChips](../components/TagFilterChips.md) |
| [TagChipList](./TagChipList.md) | `src/components/TagChipList.test.tsx` | [TagChipList](../components/TagChipList.md) |
| [TagPicker](./TagPicker.md) | `src/components/TagPicker.test.tsx` | [TagPicker](../components/TagPicker.md) |
| [CreateDeckPage](./CreateDeckPage.md) | `src/pages/CreateDeckPage.test.tsx` | [CreateDeckPage](../components/CreateDeckPage.md) |
| [HomePage](./HomePage.md) | `src/pages/HomePage.test.tsx` | [HomePage](../components/HomePage.md) |
| [useWords](./useWords.md) | `src/hooks/useWords.test.ts` | [useWords](../hooks/useWords.md) |
| [useCustomDecks](./useCustomDecks.md) | `src/hooks/useCustomDecks.test.ts` | [useCustomDecks](../hooks/useCustomDecks.md) |
| [useCustomDeckDetail](./useCustomDeckDetail.md) | `src/hooks/useCustomDeckDetail.test.ts` | [useCustomDeckDetail](../hooks/useCustomDeckDetail.md) |
| [useAllCategories](./useAllCategories.md) | `src/hooks/useAllCategories.test.ts` | [useAllCategories](../hooks/useAllCategories.md) |
| [usePublicDecks](./usePublicDecks.md) | `src/hooks/usePublicDecks.test.ts` | [usePublicDecks](../hooks/usePublicDecks.md) |
| [useAvailableDeckTags](./useAvailableDeckTags.md) | `src/hooks/useAvailableDeckTags.test.ts` | [useAvailableDeckTags](../hooks/useAvailableDeckTags.md) |
| [useRandomFlashcard](./useRandomFlashcard.md) | `src/hooks/useRandomFlashcard.test.ts` | [useRandomFlashcard](../hooks/useRandomFlashcard.md) |
| [WordGuessCombobox](./WordGuessCombobox.md) | `src/components/WordGuessCombobox.test.tsx` | [WordGuessCombobox](../components/WordGuessCombobox.md) |
| [FlashcardPage](./FlashcardPage.md) | `src/pages/FlashcardPage.test.tsx` | [FlashcardPage](../components/FlashcardPage.md) |
| [FlashcardRound](./FlashcardRound.md) | `src/components/FlashcardRound.test.tsx` | [FlashcardRound](../components/FlashcardRound.md) |
| [useTenCardsRound](./useTenCardsRound.md) | `src/hooks/useTenCardsRound.test.ts` | [useTenCardsRound](../hooks/useTenCardsRound.md) |
| [ModeSelectPage](./ModeSelectPage.md) | `src/pages/ModeSelectPage.test.tsx` | [ModeSelectPage](../components/ModeSelectPage.md) |
| [TenCardsPage](./TenCardsPage.md) | `src/pages/TenCardsPage.test.tsx` | [TenCardsPage](../components/TenCardsPage.md) |
| [useStreakScore](./useStreakScore.md) | `src/hooks/useStreakScore.test.ts` | [useStreakScore](../hooks/useStreakScore.md) |
| [useRoundProgress](./useRoundProgress.md) | `src/hooks/useRoundProgress.test.ts` | [useRoundProgress](../hooks/useRoundProgress.md) |
| [useSavedDecks](./useSavedDecks.md) | `src/hooks/useSavedDecks.test.ts` | [useSavedDecks](../hooks/useSavedDecks.md) |
| [ScorePill](./ScorePill.md) | `src/components/ScorePill.test.tsx` | [ScorePill](../components/ScorePill.md) |
| [SubCategoryChips](./SubCategoryChips.md) | `src/components/SubCategoryChips.test.tsx` | [SubCategoryChips](../components/SubCategoryChips.md) |
| [useCategoryInfo](./useCategoryInfo.md) | `src/hooks/useCategoryInfo.test.ts` | [useCategoryInfo](../hooks/useCategoryInfo.md) |
| [useUserRoles](./useUserRoles.md) | `src/hooks/useUserRoles.test.ts` | [useUserRoles](../hooks/useUserRoles.md) |
| [userStatus](./userStatus.md) | `src/lib/userStatus.test.ts` | [userStatus](../utils/userStatus.md) |

## Shared helpers

| Helper | Path | Purpose |
|---|---|---|
| [mockCategories](./mockCategories.md) | `src/test/mockCategories.ts` | Stubs the `get_categories_with_words` RPC behind `useCategories`. |
