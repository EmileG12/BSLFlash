# usePublicDecks

**Path:** `src/hooks/usePublicDecks.ts`
**Signature:** `usePublicDecks(search: string, tagIds: string[], sort: DeckSort): { decks: PublicDeck[]; loading: boolean; error: string | null; setDecks: React.Dispatch<React.SetStateAction<PublicDeck[]>> }`

Where `DeckSort` is `'likes' | 'newest' | 'name'`, and `PublicDeck` is the row shape returned by [`get_public_decks`](../rpc-functions/get_public_decks.md): `id`, `deck_name`, `owner_user_id`, `owner_name`, `tag_names`, `like_count`, `liked_by_me`, `saved_by_me`, `created_at`.

**Purpose:** Backs the [BrowseDecksPage](../components/BrowseDecksPage.md) directory. Calls [`get_public_decks`](../rpc-functions/get_public_decks.md) with the trimmed search string, the tag ids, and the sort.

**Behavior:**

- Backed by React Query's `useQuery`. The query key is `['publicDecks', trimmedSearch, joinedTagIds, sort]`, so each filter combination is its own cache entry.
- `loading` is `isLoading`. While a combination has no cached data, `decks` is `[]` and `error` is `null`, so callers never see the previous filter's results paired with the new filter's spinner.
- Returning to a combination that was already fetched shows its cached rows immediately while a background refetch runs.
- An empty search is sent as `undefined`, not `''`; an empty tag list is sent as `undefined`. Both let the RPC skip the filter.

**`setDecks`:** Lets the caller apply an optimistic update, used for the instant like and save toggles on [BrowseDecksPage](../components/BrowseDecksPage.md). It accepts the same value-or-updater form as a React state setter. It patches the cache entry for the current filter combination only, via `queryClient.setQueryData`. It does nothing if that entry has no data yet. A refetch of that combination replaces the patched rows. The hook does not roll back a failed mutation. The caller reverts its own optimistic change on error.

**Used by:** [BrowseDecksPage](../components/BrowseDecksPage.md).

**Tested by:** [docs/tests/usePublicDecks.md](../tests/usePublicDecks.md).
