# usePublicDecks.test.ts

**Path:** `src/hooks/usePublicDecks.test.ts`
**Tests:** [usePublicDecks](../hooks/usePublicDecks.md)

## Coverage

- Starts in a loading state with an empty `decks` array.
- Calls `get_public_decks` with the trimmed search, the tag ids and the sort.
- Omits the search and tag arguments when they are empty.
- Sets an error message when the RPC fails.
- `setDecks` applies an optimistic update to the current decks.

## Notes

Mocks `../lib/supabase`'s `rpc` via an explicit factory. Renders via the shared [`renderHookWithQueryClient`](../../src/test/renderHookWithQueryClient.tsx) helper (fresh `QueryClientProvider` with retries disabled, since the hook uses `useQuery`), with `act`/`waitFor` from `@testing-library/react`. The AND-semantics tag filter and the sort order are SQL behaviour of [`get_public_decks`](../rpc-functions/get_public_decks.md) and are not exercised here; this file asserts only the arguments the hook sends.
