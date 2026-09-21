# FlashcardRound.test.tsx

**Path:** `src/components/FlashcardRound.test.tsx`
**Tests:** [FlashcardRound](../components/FlashcardRound.md)

## Coverage

- Renders the video and combobox for the given flashcard.
- Correct guess: shows "Correct!" + the real answer, and calls `onAdvance` with `{ wordId, correct: true }`.
- Incorrect guess: shows "Incorrect." + the real answer, and calls `onAdvance` with `correct: false`.
- The `advanceLabel` prop renders as the reveal button's text (e.g. `"See results"`).
- Advancing returns the component to the guessing combobox (ready for the next `flashcard` prop).

## Notes

No Supabase mocking needed — `flashcard`/`words` are passed directly as props, and `onAdvance` is a plain `vi.fn()` spy. This is where the guess/reveal/correctness-check behavior is tested directly now that it's been extracted out of `FlashcardPage` — [FlashcardPage.test.tsx](./FlashcardPage.md) and [TenCardsPage.test.tsx](./TenCardsPage.md) only assert on how their own page-level logic reacts to an `onAdvance` result, not on the reveal mechanics themselves.
