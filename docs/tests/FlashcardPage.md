# FlashcardPage.test.tsx

**Path:** `src/pages/FlashcardPage.test.tsx`
**Tests:** [FlashcardPage](../components/FlashcardPage.md)

## Coverage

- Shows a loading message before the flashcard and word list resolve.
- Shows an error message when the flashcard fails to load.
- Shows an empty-state message when the category has no eligible words.
- Renders [FlashcardRound](../components/FlashcardRound.md) once loaded, and advancing draws a new word (re-triggers the RPC call) regardless of whether the guess was correct — the correctness/reveal mechanics themselves are covered by [FlashcardRound.test.tsx](./FlashcardRound.md), not duplicated here.
- Forwards a `?subcategory=` query param through to [useRandomFlashcard](../hooks/useRandomFlashcard.md)'s RPC call as `subcategory_id`.
- The [ScorePill](../components/ScorePill.md) showing `streak` starts at 0, increments to 1 after a correct guess is advanced past, and resets back to 0 after a subsequent wrong guess — exercising [useStreakScore](../hooks/useStreakScore.md) through the page rather than mocking it.

## Notes

Mocks `../lib/supabase`'s `from`, `rpc`, and `storage.from(...).getPublicUrl`. Renders inside a `MemoryRouter`/`Routes` with an initial entry matching `/flashcards/:deckType/:categoryId/practice` (its real route), since the page reads `deckType`/`categoryId` via `useParams`. Renders via [renderWithQueryClient](./renderWithQueryClient.md), since the page calls [useRandomFlashcard](../hooks/useRandomFlashcard.md) and [useWords](../hooks/useWords.md), which require a `QueryClientProvider` ancestor.
