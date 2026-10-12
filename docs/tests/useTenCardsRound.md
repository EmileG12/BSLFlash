# useTenCardsRound.test.ts

**Path:** `src/hooks/useTenCardsRound.test.ts`
**Tests:** [useTenCardsRound](../hooks/useTenCardsRound.md)

## Coverage

- Starts in a loading state with an empty `cards` array.
- Returns every row mapped to a `Flashcard`, with each `videoUrl` built from the mocked `getPublicUrl` result.
- Sets `empty` when the RPC returns zero rows.
- Sets an error message when the RPC call fails.
- Returns fewer than the requested count (without setting `empty`) when the category has fewer eligible words.
- Passes `is_custom: true` to the RPC when called with `deckType: 'custom'` (every other test calls it with `'standard'`).
- Omits `subcategory_id` from the RPC call when none is given.
- Passes `subcategory_id` to the RPC when given.
- Refetches when `subcategoryId` changes.

## Notes

Mocks `../lib/supabase`'s `rpc` and `storage.from(...).getPublicUrl` via explicit factories, same style as [useRandomFlashcard.test.ts](./useRandomFlashcard.md). Renders via the shared [`renderHookWithQueryClient`](../../src/test/renderHookWithQueryClient.tsx) helper (fresh `QueryClientProvider` with retries disabled, since the hook uses `useQuery`), with `waitFor` from `@testing-library/react`. No `next()` to test here, unlike `useRandomFlashcard` — the whole round is fetched once. The `subcategoryId` refetch case relies on the query key changing, not on a manual refetch call.
