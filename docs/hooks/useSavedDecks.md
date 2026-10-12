# useSavedDecks

**Path:** `src/hooks/useSavedDecks.ts`
**Signature:** `useSavedDecks(): { savedDecks: SavedDeck[]; loading: boolean; error: string | null; setSavedDecks: React.Dispatch<React.SetStateAction<SavedDeck[]>> }`, where `SavedDeck` is `{ id: string; deck_name: string; owner_user_id: string; owner_name: string | null }`.

**Purpose:** Fetches the decks the signed-in user has added to their library from the Browse directory, for the "Saved Decks" section of [MyDecksPage](../components/MyDecksPage.md).

**Behavior:** Backed by React Query's `useQuery` under query key `['savedDecks']`. The `queryFn` calls [`get_saved_decks`](../rpc-functions/get_saved_decks.md) and throws on error. The hook maps `isLoading`/`error`/`data` onto `loading`/`error`/`savedDecks`. Requires a `QueryClientProvider` ancestor (wired once in `main.tsx`).

`id` is the `custom_decks` id, which is also the `saved_decks.custom_deck_id` the row is keyed by. The page uses it both to navigate and to unsave.

**Local removal:** `setSavedDecks` is returned so [MyDecksPage](../components/MyDecksPage.md) can drop a deck from the list after it deletes the `saved_decks` row, without a refetch. It is a state-style setter implemented with `queryClient.setQueryData` on the same key. It does nothing before the first fetch has resolved. The hook itself never removes anything.

**Filtering:** The hook does no filtering of its own. A save whose deck the owner has unpublished never reaches it, because [`get_saved_decks`](../rpc-functions/get_saved_decks.md) omits it.

**Used by:** [MyDecksPage](../components/MyDecksPage.md).

**Tested by:** [docs/tests/useSavedDecks.md](../tests/useSavedDecks.md).
