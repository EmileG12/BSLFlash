# useCategories

**Path:** `src/hooks/useCategories.ts`
**Signature:** `useCategories(): { categories: Category[]; loading: boolean; error: string | null }`

**Purpose:** Fetches every row from the [`categories`](../db-schema/categories.md) table so components can list available flashcard decks.

**Behavior:** On mount, queries `categories` for `id, category_name` ordered by `category_name`, via the shared [`supabase`](../utils/supabase-client.md) client (RLS allows any authenticated user to read all rows). Sets `loading` to `false` once the request settles, and `error` to the Postgres error message if the query fails. Guards against setting state after unmount with a `cancelled` flag.

**Used by:** [SelectDeckCard](../components/SelectDeckCard.md).
