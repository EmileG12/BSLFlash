# usePublicDecks

**Path:** `src/hooks/usePublicDecks.ts`
**Signature:** `usePublicDecks(search: string, tagIds: string[], sort: DeckSort): { decks: PublicDeck[]; loading: boolean; error: string | null; setDecks: React.Dispatch<React.SetStateAction<PublicDeck[]>> }`

Where `DeckSort` is `'likes' | 'newest' | 'name'`, and `PublicDeck` is the row shape returned by [`get_public_decks`](../rpc-functions/get_public_decks.md): `id`, `deck_name`, `owner_user_id`, `owner_name`, `tag_names`, `like_count`, `liked_by_me`, `saved_by_me`, `created_at`.

**Purpose:** Backs the [BrowseDecksPage](../components/BrowseDecksPage.md) directory. Calls [`get_public_decks`](../rpc-functions/get_public_decks.md) with the trimmed search string, the tag ids, and the sort.

**Behavior:**

- `loading` is derived, not stored. The hook keeps the last completed fetch together with a `requestKey` built from the trimmed search, the joined tag ids and the sort. `loading` is simply "the last completed fetch's key does not match the current one", the same pattern as [useRandomFlashcard](./useRandomFlashcard.md). Changing a filter therefore needs no separate reset-to-loading call.
- While loading, `decks` is `[]` and `error` is `null`, so callers never see the previous filter's results paired with the new filter's spinner.
- A stale response (one superseded by a later filter change) is dropped by the `cancelled` flag in the effect cleanup.
- An empty search is sent as `undefined`, not `''`; an empty tag list is sent as `undefined`. Both let the RPC skip the filter.

**`setDecks`:** Lets the caller apply an optimistic update to the current `decks`, used for the instant like and save toggles on [BrowseDecksPage](../components/BrowseDecksPage.md). It accepts the same value-or-updater form as a React state setter. It applies to the last completed result only; if no fetch has completed yet it does nothing. The hook does not roll back a failed mutation. The caller reverts its own optimistic change on error.

**Used by:** [BrowseDecksPage](../components/BrowseDecksPage.md).
