# useCustomDecks.test.ts

**Path:** `src/hooks/useCustomDecks.test.ts`
**Tests:** [useCustomDecks](../hooks/useCustomDecks.md)

## Coverage

- Starts in a loading state with an empty `customDecks` array.
- Returns the fetched custom decks, querying with the signed-in user's id (`.eq('user_id', ...)`).
- Sets an error message when the fetch fails.
- Returns an empty list when the user has no custom decks.
- Returns an empty list, with no deck query needed for the result, when there is no signed-in user.

## Notes

Mocks `../lib/supabase` via an explicit factory with both `from` and `auth.getUser`. A `mockUser` helper resolves `getUser` to a fixed user id, and `mockCustomDecks` chains `select().eq().order()` and returns the `eq` mock so the owner-filter case can assert its arguments. The no-user case overrides `getUser` to resolve with `user: null`.

The RLS policies that also admit other users' published decks are enforced in Postgres and are not exercised by this file. The owner-id filter is the only client-side scoping under test.
