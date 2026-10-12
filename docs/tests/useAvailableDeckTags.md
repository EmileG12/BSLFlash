# useAvailableDeckTags.test.ts

**Path:** `src/hooks/useAvailableDeckTags.test.ts`
**Tests:** [useAvailableDeckTags](../hooks/useAvailableDeckTags.md)

## Coverage

- Starts in a loading state with an empty `tags` array.
- Returns the tags from the `get_available_deck_tags` RPC once it resolves.
- Sets an error message when the RPC fails.

## Notes

Mocks `../lib/supabase`'s `rpc` via an explicit factory, same style as [SubCategoryChips.test.tsx](./SubCategoryChips.md). Renders via the shared [`renderHookWithQueryClient`](../../src/test/renderHookWithQueryClient.tsx) helper (fresh `QueryClientProvider` with retries disabled, since the hook uses `useQuery`), with `waitFor` from `@testing-library/react`.
