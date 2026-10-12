# useAvailableDeckTags

**Path:** `src/hooks/useAvailableDeckTags.ts`
**Signature:** `useAvailableDeckTags(): { tags: DeckTag[]; loading: boolean; error: string | null }` where `DeckTag` is `{ id: string; category_name: string }`.

**Purpose:** Fetches the tags offered as filter chips in the [BrowseDecksPage](../components/BrowseDecksPage.md) directory, via [TagFilterChips](../components/TagFilterChips.md). Same return shape as [useCategories](./useCategories.md).

**Behavior:** Backed by React Query's `useQuery` under query key `['availableDeckTags']`. The `queryFn` calls [`get_available_deck_tags`](../rpc-functions/get_available_deck_tags.md) with no arguments. The RPC returns only the [`categories`](../db-schema/categories.md) rows that tag at least one published deck, so a tag with no public decks never appears as a chip. The hook maps `isLoading`/`error`/`data` onto `loading`/`error`/`tags`. Requires a `QueryClientProvider` ancestor (wired once in `main.tsx`).

**Used by:** [TagFilterChips](../components/TagFilterChips.md).

**Tested by:** [docs/tests/useAvailableDeckTags.md](../tests/useAvailableDeckTags.md).
