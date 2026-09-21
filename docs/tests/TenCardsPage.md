# TenCardsPage.test.tsx

**Path:** `src/pages/TenCardsPage.test.tsx`
**Tests:** [TenCardsPage](../components/TenCardsPage.md)

## Coverage

- Shows a loading message before the round and word list resolve.
- Shows an error message when the round fails to load.
- Shows an empty-state message when the category has no eligible words.
- Shows "Next card" on a non-last card and "See results" on the last card.
- Steps through a two-card round (one correct, one incorrect answer) and ends on a summary showing the right score.
- "Back to modes" navigates to `/flashcards/:categoryId` (mode select) for the same category.
- A category with fewer eligible words than requested (a one-card round) still reaches a summary instead of hanging or erroring.

## Notes

Mocks `../lib/supabase`'s `from`, `rpc`, and `storage.from(...).getPublicUrl`. Renders inside a `MemoryRouter`/`Routes` with an initial entry matching `/flashcards/:categoryId/ten-cards`, plus a stub `/flashcards/:categoryId` route to assert the "Back to modes" navigation against. Only the page-level scoring/advancing logic is exercised here — the underlying guess/reveal mechanics are covered by [FlashcardRound.test.tsx](./FlashcardRound.md).
