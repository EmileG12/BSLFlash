# useTenCardsRound.test.ts

**Path:** `src/hooks/useTenCardsRound.test.ts`
**Tests:** [useTenCardsRound](../hooks/useTenCardsRound.md)

## Coverage

- Starts in a loading state with an empty `cards` array.
- Returns every row mapped to a `Flashcard`, with each `videoUrl` built from the mocked `getPublicUrl` result.
- Sets `empty` when the RPC returns zero rows.
- Sets an error message when the RPC call fails.
- Returns fewer than the requested count (without setting `empty`) when the category has fewer eligible words.

## Notes

Mocks `../lib/supabase`'s `rpc` and `storage.from(...).getPublicUrl` via explicit factories, same style as [useRandomFlashcard.test.ts](./useRandomFlashcard.md). Uses `renderHook`/`waitFor` from `@testing-library/react`. No `next()`/refetch to test here, unlike `useRandomFlashcard` — the whole round is fetched once.
