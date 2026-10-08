# useCustomCategories.test.ts

**Path:** `src/hooks/useCustomCategories.test.ts`
**Tests:** [useCustomCategories](../hooks/useCustomCategories.md)

## Coverage

- Starts in a loading state with an empty `customCategories` array.
- Returns the fetched custom categories once the request resolves.
- Sets an error message when the fetch fails.
- Returns an empty list when the user has no custom decks.

## Notes

Mocks `../lib/supabase` (`supabase.from`) via an explicit factory, chaining mocked `select`/`order` calls — same pattern as [useWords.test.ts](./useWords.md), minus a `.eq(...)` filter since the hook relies on RLS instead of an explicit `user_id` filter. Uses `renderHook`/`waitFor` from `@testing-library/react`.
