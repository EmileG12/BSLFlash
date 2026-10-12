# useWordVariants.test.ts

**Path:** `src/hooks/useWordVariants.test.ts`
**Tests:** [useWordVariants](../hooks/useWordVariants.md)

## Coverage

- Starts in a loading state with an empty `variants` array.
- Returns a word's sign variants, each with its nested video pool.
- Sets an error message when the fetch fails.
- `setVariants` applies a local update (moving the `is_primary` flag to a different variant) to the list, as the word edit page does after `set_primary_sign`.

## Notes

Mocks `../lib/supabase`'s `from` via an explicit factory, chaining a mocked `select().eq().order()`. Renders via the shared [`renderHookWithQueryClient`](../../src/test/renderHookWithQueryClient.tsx) helper (fresh `QueryClientProvider` with retries disabled, since the hook uses `useQuery`), with `act` and `waitFor` from `@testing-library/react`.
