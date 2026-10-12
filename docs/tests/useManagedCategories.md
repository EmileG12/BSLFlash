# useManagedCategories.test.ts

**Path:** `src/hooks/useManagedCategories.test.ts`
**Tests:** [useManagedCategories](../hooks/useManagedCategories.md)

## Coverage

- Starts in a loading state with an empty `categories` array.
- Returns every category, including disabled ones.
- Sets an error message when the fetch fails.
- `setCategories` applies a local update (flipping `is_active` on one row) to the list.

## Notes

Mocks `../lib/supabase`'s `from` via an explicit factory, chaining a mocked `select().order()`. Renders via the shared [`renderHookWithQueryClient`](../../src/test/renderHookWithQueryClient.tsx) helper (fresh `QueryClientProvider` with retries disabled, since the hook uses `useQuery`), with `act` and `waitFor` from `@testing-library/react`.
