# FlashcardPage.test.tsx

**Path:** `src/pages/FlashcardPage.test.tsx`
**Tests:** [FlashcardPage](../components/FlashcardPage.md)

## Coverage

- Shows a loading message before the flashcard and word list resolve.
- Renders the combobox once both resolve.
- Correct guess: shows "Correct!" and the actual word/definition.
- Incorrect guess: shows "Incorrect." and still shows the actual word/definition.
- "Next sign" returns to the guessing phase and re-triggers the RPC call.
- Shows an empty-state message when the category has no eligible words.

## Notes

Mocks `../lib/supabase`'s `from`, `rpc`, and `storage.from(...).getPublicUrl`. Renders inside a `MemoryRouter`/`Routes` with an initial entry matching `/flashcards/:categoryId`, since the page reads `categoryId` via `useParams`.
