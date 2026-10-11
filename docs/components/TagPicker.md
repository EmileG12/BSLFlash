# TagPicker

**Path:** `src/components/TagPicker.tsx`

**Purpose:** The tag multi-select inside the [EditDeckModal](./EditDeckModal.md). It offers the full [`categories`](../db-schema/categories.md) list, not only tags already in use on a public deck, because a deck being tagged for the first time needs every tag available. Its sibling [TagFilterChips](./TagFilterChips.md) offers only tags in use, for the directory filter.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `selectedIds` | `string[]` | Ids of the tags currently selected on the deck. |
| `onToggle` | `(id: string) => void` | Called with the clicked tag's id. The parent (EditDeckModal) adds or removes it from its own selection. |

**Key behavior:** Fetches its own list through [useAllCategories](../hooks/useAllCategories.md) and renders [TagChipList](./TagChipList.md) with heading "Tags". When the list is empty and settled, it shows "No tags available yet." in place of the chips. Selection state is owned by the parent; this component holds none.

**Depends on:** [useAllCategories](../hooks/useAllCategories.md), [TagChipList](./TagChipList.md).

**Used by:** [EditDeckModal](./EditDeckModal.md).

**Tested by:** [docs/tests/TagPicker.md](../tests/TagPicker.md).
