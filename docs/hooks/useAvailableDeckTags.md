# useAvailableDeckTags

**Path:** `src/hooks/useAvailableDeckTags.ts`
**Signature:** `useAvailableDeckTags(): { tags: DeckTag[]; loading: boolean; error: string | null }` where `DeckTag` is `{ id: string; category_name: string }`.

**Purpose:** Fetches the tags offered as filter chips in the [BrowseDecksPage](../components/BrowseDecksPage.md) directory, via [TagFilterChips](../components/TagFilterChips.md). Same shape as [useCategories](./useCategories.md).

**Behavior:** On mount, calls [`get_available_deck_tags`](../rpc-functions/get_available_deck_tags.md) with no arguments. The RPC returns only the [`categories`](../db-schema/categories.md) rows that tag at least one published deck, so a tag with no public decks never appears as a chip. Sets `loading` to `false` once the request settles, and `error` to the message if it fails. Guards against setting state after unmount with a `cancelled` flag.

**Used by:** [TagFilterChips](../components/TagFilterChips.md).
