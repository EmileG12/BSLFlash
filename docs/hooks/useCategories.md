# useCategories

**Path:** `src/hooks/useCategories.ts`
**Signature:** `useCategories(vocabulary: boolean): { categories: Category[]; loading: boolean; error: string | null }`

**Purpose:** Fetches [`categories`](../db-schema/categories.md) rows matching the given `is_vocabulary` value, so components can list either topic decks (`vocabulary: false`) or vocabulary-requirement decks like GCSE (`vocabulary: true`) — see the table's own doc for what that flag means.

**Behavior:** On mount (and whenever `vocabulary` changes), queries `categories` for `id, category_name, is_vocabulary` filtered by `.eq('is_vocabulary', vocabulary)`, ordered by `category_name`, via the shared [`supabase`](../utils/supabase-client.md) client (RLS allows any authenticated user to read all rows). The filter runs server-side rather than fetching everything and filtering in the client. Sets `loading` to `false` once the request settles, and `error` to the Postgres error message if the query fails. Guards against setting state after unmount with a `cancelled` flag.

**Used by:** [SelectDeckCard](../components/SelectDeckCard.md).
