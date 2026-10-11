# useCategories

**Path:** `src/hooks/useCategories.ts`
**Signature:** `useCategories(vocabulary: boolean): { categories: Category[]; loading: boolean; error: string | null }` where `Category` is `{ id: string; category_name: string; is_vocabulary: boolean }`.

**Purpose:** Fetches the [`categories`](../db-schema/categories.md) that have at least one word, filtered by the given `is_vocabulary` value, so components can list either topic decks (`vocabulary: false`) or vocabulary-requirement decks like GCSE (`vocabulary: true`). See the table's own doc for what that flag means.

**Behavior:** On mount (and whenever `vocabulary` changes), calls [`get_categories_with_words`](../rpc-functions/get_categories_with_words.md) with `{ p_is_vocabulary: vocabulary }`, via the shared [`supabase`](../utils/supabase-client.md) client. The filtering and ordering happen in the RPC.

The RPC exists because a `categories` row can now be a deck tag with no words attached ([`custom_deck_tags`](../db-schema/custom_deck_tags.md)). A direct `from('categories')` read would list those tag-only rows as playable decks; the RPC's `EXISTS` check against `word_categories` excludes them. Sets `loading` to `false` once the request settles, and `error` to the message if the call fails. Guards against setting state after unmount with a `cancelled` flag.

**Used by:** [SelectDeckCard](../components/SelectDeckCard.md), [NavBar](../components/NavBar.md)'s [CategoryMenu](../components/CategoryMenu.md), [MobileNavSheet](../components/MobileNavSheet.md).
