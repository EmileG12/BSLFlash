# TagFilterChips

**Path:** `src/components/TagFilterChips.tsx`

**Purpose:** The tag filter row on [BrowseDecksPage](./BrowseDecksPage.md). Multi-select chips, one per tag currently used by at least one published deck.

It is deliberately a separate component from [SubCategoryChips](./SubCategoryChips.md), not a variant of it. SubCategoryChips is single-select and means "narrow to one topic". This is multi-select, where any number of tags can be active and a deck must carry all of them (AND semantics, enforced server-side by [`get_public_decks`](../rpc-functions/get_public_decks.md)). Forcing both into one component would need a mode prop that changes the meaning of the selection.

It is a thin wrapper around [TagChipList](./TagChipList.md), which holds the chip markup. Its only job is to supply the tags from [useAvailableDeckTags](../hooks/useAvailableDeckTags.md) and the "Filter by tag" heading. [TagPicker](./TagPicker.md), the deck-editing tag list, wraps the same component with a different data source.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `selectedIds` | `string[]` | Ids of the tags currently active. A chip is `aria-pressed` when its id is in this list. |
| `onToggle` | `(id: string) => void` | Called with the clicked tag's id. The parent adds or removes it. |

**Key behavior:** Fetches its own tag list through [useAvailableDeckTags](../hooks/useAvailableDeckTags.md), so the parent passes only the selection. It passes no `emptyMessage` to [TagChipList](./TagChipList.md), so the filter row renders nothing when the fetch has settled with no tags and no error. While loading, TagChipList shows four skeleton pills and a `sr-only` "Loading tags…" announcement. On error, it passes `errorMessage="Tags unavailable — showing all decks"` to TagChipList, so that specific note appears under the heading (TagPicker, the other caller, keeps TagChipList's generic default instead). The deck list itself is unaffected, because it comes from a separate hook.

**Depends on:** [useAvailableDeckTags](../hooks/useAvailableDeckTags.md), [TagChipList](./TagChipList.md).

**Used by:** [BrowseDecksPage](./BrowseDecksPage.md).

**Tested by:** [docs/tests/TagFilterChips.md](../tests/TagFilterChips.md).
