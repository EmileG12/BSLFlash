# useSavedDecks.test.ts

**Path:** `src/hooks/useSavedDecks.test.ts`
**Tests:** [useSavedDecks](../hooks/useSavedDecks.md)

## Coverage

- Starts in a loading state with an empty `savedDecks` list.
- Returns the decks fetched from `get_saved_decks`, once loading finishes.
- Sets `error` to the RPC's message when the fetch fails.
- `setSavedDecks` applies a local removal to the list.

## Notes

Mocks `../lib/supabase` with an `rpc` mock only, and uses `renderHook`/`act`/`waitFor` from `@testing-library/react`. The dormant-save exclusion is not exercised here: it happens inside the `get_saved_decks` SQL, and this file mocks the RPC result directly.
