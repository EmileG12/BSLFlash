# useCategories

**Path:** `src/hooks/useCategories.ts`
**Signature:** `useCategories(vocabulary: boolean): { categories: Category[]; loading: boolean; error: string | null }` where `Category` is `{ id: string; category_name: string; is_vocabulary: boolean }`.

**Purpose:** Fetches the [`categories`](../db-schema/categories.md) that have at least one word, filtered by the given `is_vocabulary` value, so components can list either topic decks (`vocabulary: false`) or vocabulary-requirement decks like GCSE (`vocabulary: true`). See the table's own doc for what that flag means.

**Behavior:** Backed by React Query's `useQuery`. The query key is `['categories', 'withWords', vocabulary]`, so the two variants are cached separately. The `queryFn` calls [`get_categories_with_words`](../rpc-functions/get_categories_with_words.md) with `{ p_is_vocabulary: vocabulary }`, via the shared [`supabase`](../utils/supabase-client.md) client. The filtering and ordering happen in the RPC. The hook maps `isLoading`/`error`/`data` onto `loading`/`error`/`categories`. Requires a `QueryClientProvider` ancestor (wired once in `main.tsx`).

The RPC exists because a `categories` row can now be a deck tag with no words attached ([`custom_deck_tags`](../db-schema/custom_deck_tags.md)). A direct `from('categories')` read would list those tag-only rows as playable decks; the RPC's `EXISTS` check against `word_categories` excludes them.

**Used by:** [SelectDeckCard](../components/SelectDeckCard.md), [NavBar](../components/NavBar.md)'s [CategoryMenu](../components/CategoryMenu.md), [MobileNavSheet](../components/MobileNavSheet.md).
