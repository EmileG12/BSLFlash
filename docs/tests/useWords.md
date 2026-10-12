# useWords.test.ts

**Path:** `src/hooks/useWords.test.ts`
**Tests:** [useWords](../hooks/useWords.md)

## Coverage

- Starts in a loading state with an empty word list.
- Returns the fetched words once the request resolves.
- Sets an error message when the fetch fails.
- Returns an empty list when there are no words.

## Notes

Mocks `../lib/supabase` (`supabase.from`) the same way as [SelectDeckCard.test.tsx](./SelectDeckCard.md), chaining mocked `select`/`order` calls. Renders via the shared [`renderHookWithQueryClient`](../../src/test/renderHookWithQueryClient.tsx) helper (fresh `QueryClientProvider` with retries disabled, since the hook uses `useQuery`), with `waitFor` from `@testing-library/react`. `result.current` is the hook's live return value.
