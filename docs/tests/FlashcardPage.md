# FlashcardPage.test.tsx

**Path:** `src/pages/FlashcardPage.test.tsx`
**Tests:** [FlashcardPage](../components/FlashcardPage.md)

## Coverage

- Shows a loading message before the flashcard and word list resolve.
- Shows an error message when the flashcard fails to load.
- Shows an empty-state message when the category has no eligible words.
- Renders [FlashcardRound](../components/FlashcardRound.md) once loaded, and advancing draws a new word (re-triggers the RPC call) regardless of whether the guess was correct — the correctness/reveal mechanics themselves are covered by [FlashcardRound.test.tsx](./FlashcardRound.md), not duplicated here.

## Notes

Mocks `../lib/supabase`'s `from`, `rpc`, and `storage.from(...).getPublicUrl`. Renders inside a `MemoryRouter`/`Routes` with an initial entry matching `/flashcards/:categoryId/practice` (its real route), since the page reads `categoryId` via `useParams`.
