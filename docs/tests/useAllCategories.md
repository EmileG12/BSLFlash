# useAllCategories.test.ts

**Path:** `src/hooks/useAllCategories.test.ts`
**Tests:** [useAllCategories](../hooks/useAllCategories.md)

## Coverage

- Starts in a loading state with an empty `categories` array.
- Returns the fetched categories once the request resolves.
- Sets an error message when the fetch fails.

## Notes

Mocks `../lib/supabase`'s `from` via an explicit factory, chaining a mocked `select().order()`. Renders via the shared [`renderHookWithQueryClient`](../../src/test/renderHookWithQueryClient.tsx) helper (wraps in a fresh `QueryClientProvider` with retries disabled, since the hook uses `useQuery`), then uses `waitFor` from `@testing-library/react`.
