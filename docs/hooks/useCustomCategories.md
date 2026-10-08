# useCustomCategories

**Path:** `src/hooks/useCustomCategories.ts`
**Signature:** `useCustomCategories(): { customCategories: CustomCategory[]; loading: boolean; error: string | null }`

**Purpose:** Fetches the signed-in user's custom decks (`id`, `category_name`), for [MyDecksPage](../components/MyDecksPage.md) to list via [DeckGrid](../components/DeckGrid.md). Mirrors [useCategories](./useCategories.md)'s shape and fetch pattern, but queries [`custom_categories`](../db-schema/custom_categories.md) instead of `categories`.

**Behavior:** Calls `supabase.from('custom_categories').select('id, category_name').order('category_name')` on mount. Unlike `useCategories`, takes no parameter and applies no explicit `.eq(...)` filter — [`custom_categories`](../rls-policies/custom_categories/README.md)'s `select` policy already scopes rows to `user_id = auth.uid()`, so an unfiltered select only ever returns the caller's own decks.

**Used by:** [MyDecksPage](../components/MyDecksPage.md).
