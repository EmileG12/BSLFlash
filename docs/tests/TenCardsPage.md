# TenCardsPage.test.tsx

**Path:** `src/pages/TenCardsPage.test.tsx`
**Tests:** [TenCardsPage](../components/TenCardsPage.md)

## Coverage

- Shows a loading message before the round and word list resolve.
- Shows an error message when the round fails to load.
- Shows an empty-state message when the category has no eligible words.
- Shows "Next card" on a non-last card and "See results" on the last card.
- Steps through a two-card round (one correct, one incorrect answer) and ends on a summary showing the right score.
- "Back to modes" navigates to `/flashcards/:deckType/:categoryId` (mode select) for the same category.
- Forwards a `?subcategory=` query param through to [useTenCardsRound](../hooks/useTenCardsRound.md)'s RPC call as `subcategory_id`, and "Back to modes" preserves it in the URL it navigates to.
- A category with fewer eligible words than requested (a one-card round) still reaches a summary instead of hanging or erroring.
- The [ScorePill](../components/ScorePill.md) showing round/score progress reads `Round 1/2, Score 0/2` at the start, updates to `Round 2/2, Score 1/2` after the first (correct) card is advanced past, and is gone once the round reaches the summary screen.

## Notes

Mocks `../lib/supabase`'s `from`, `rpc`, and `storage.from(...).getPublicUrl`. Renders inside a `MemoryRouter`/`Routes` with an initial entry matching `/flashcards/:deckType/:categoryId/ten-cards`, plus a stub `/flashcards/:deckType/:categoryId` route to assert the "Back to modes" navigation against. Only the page-level scoring/advancing logic is exercised here — the underlying guess/reveal mechanics are covered by [FlashcardRound.test.tsx](./FlashcardRound.md). Renders via [renderWithQueryClient](./renderWithQueryClient.md), since the page calls [useTenCardsRound](../hooks/useTenCardsRound.md) and [useWords](../hooks/useWords.md), which require a `QueryClientProvider` ancestor.
