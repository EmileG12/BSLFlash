# useAllCategories

**Path:** `src/hooks/useAllCategories.ts`
**Signature:** `useAllCategories(): { categories: CategoryTag[]; loading: boolean; error: string | null }` where `CategoryTag` is `{ id: string; category_name: string }`.

**Purpose:** Fetches every [`categories`](../db-schema/categories.md) row, for the tag list in [TagPicker](../components/TagPicker.md) inside the [EditDeckModal](../components/EditDeckModal.md). It is deliberately a third category source, distinct from the two others:

- [useCategories](./useCategories.md) returns only categories that have at least one word, filtered by vocabulary kind. It feeds the standard deck menus.
- [useAvailableDeckTags](./useAvailableDeckTags.md) returns only tags currently used by a published deck. It feeds the directory filter.

A deck being tagged for the first time needs every tag on offer, including a category with zero words that exists only as a tag. Neither of the other two sources can supply that.

**Behavior:** On mount, selects `id, category_name` from `categories`, ordered by `category_name`, with no filter. Rows are readable under the categories select policy ([categories_select_authenticated](../rls-policies/categories/categories_select_authenticated.md)). Sets `loading` to `false` once the request settles, and `error` to the message if it fails. Guards against setting state after unmount with a `cancelled` flag.

**Used by:** [TagPicker](../components/TagPicker.md).

**Tested by:** [docs/tests/useAllCategories.md](../tests/useAllCategories.md).
