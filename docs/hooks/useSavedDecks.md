# useSavedDecks

**Path:** `src/hooks/useSavedDecks.ts`
**Signature:** `useSavedDecks(): { savedDecks: SavedDeck[]; loading: boolean; error: string | null; setSavedDecks: React.Dispatch<React.SetStateAction<SavedDeck[]>> }`, where `SavedDeck` is `{ id: string; deck_name: string; owner_user_id: string; owner_name: string | null }`.

**Purpose:** Fetches the decks the signed-in user has added to their library from the Browse directory, for the "Saved Decks" section of [MyDecksPage](../components/MyDecksPage.md).

**Behavior:** Calls [`get_saved_decks`](../rpc-functions/get_saved_decks.md) once on mount (empty dependency array) and never refetches. A `cancelled` flag in the effect cleanup discards a response that arrives after unmount. On error, `error` is set to the message and `savedDecks` stays empty; on success, `savedDecks` is the RPC result (or `[]`).

`id` is the `custom_decks` id, which is also the `saved_decks.custom_deck_id` the row is keyed by. The page uses it both to navigate and to unsave.

**Local removal:** `setSavedDecks` is returned so [MyDecksPage](../components/MyDecksPage.md) can drop a deck from the list after it deletes the `saved_decks` row, without a refetch. The hook itself never removes anything.

**Filtering:** The hook does no filtering of its own. A save whose deck the owner has unpublished never reaches it, because [`get_saved_decks`](../rpc-functions/get_saved_decks.md) omits it.

**Used by:** [MyDecksPage](../components/MyDecksPage.md).

**Tested by:** [docs/tests/useSavedDecks.md](../tests/useSavedDecks.md).
