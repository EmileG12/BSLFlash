# useRandomFlashcard.test.ts

**Path:** `src/hooks/useRandomFlashcard.test.ts`
**Tests:** [useRandomFlashcard](../hooks/useRandomFlashcard.md)

## Coverage

- Starts in a loading state.
- Returns the flashcard with its video URL built from the mocked `getPublicUrl` result.
- Sets `empty` when the RPC returns zero rows.
- Sets an error message when the RPC call fails.
- `next()` re-triggers the RPC call to draw a new word, and `loading` is `false` once that draw settles. The intermediate loading state during the `next()` refetch is not asserted, since the mocked RPC resolves too quickly for it to be observed reliably.
- Passes `is_custom: true` to the RPC when called with `deckType: 'custom'` (every other test calls it with `'standard'`).
- Omits `subcategory_id` from the RPC call when none is given.
- Passes `subcategory_id` to the RPC when given.
- Refetches (going back through a loading state) when `subcategoryId` changes.

## Notes

Mocks `../lib/supabase`'s `rpc` and `storage.from(...).getPublicUrl` via explicit factories. Renders via the shared [`renderHookWithQueryClient`](../../src/test/renderHookWithQueryClient.tsx) helper (fresh `QueryClientProvider` with retries disabled, since the hook uses `useQuery`), with `waitFor` from `@testing-library/react`, and `act()` around the bare `result.current.next()` call — since that call triggers a state update outside of any React event handler, `act()` is needed to flush it before assertions run.
