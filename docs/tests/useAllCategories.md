# useAllCategories.test.ts

**Path:** `src/hooks/useAllCategories.test.ts`
**Tests:** [useAllCategories](../hooks/useAllCategories.md)

## Coverage

- Starts in a loading state with an empty `categories` array.
- Returns the fetched categories once the request resolves.
- Sets an error message when the fetch fails.

## Notes

Mocks `../lib/supabase`'s `from` via an explicit factory, chaining a mocked `select().order()`. Uses `renderHook`/`waitFor` from `@testing-library/react`.
