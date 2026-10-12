# useManagedCategories

**Path:** `src/hooks/useManagedCategories.ts`
**Signature:** `useManagedCategories(): { categories: ManagedCategory[]; loading: boolean; error: string | null; setCategories: React.Dispatch<React.SetStateAction<ManagedCategory[]>> }`

Where `ManagedCategory` is `{ id: string; category_name: string; is_vocabulary: boolean; is_active: boolean }`.

**Purpose:** Fetches every row of `categories`, including disabled ones, ordered by name, for the superadmin [Categories](../components/SuperadminCategoriesPage.md) page.

**Why a separate hook:** the end-user category hooks ([useCategories](./useCategories.md), [useAllCategories](./useAllCategories.md)) only ever need the categories that are offered for play or tagging, so they select a narrower shape. This hook exists so the management page can see the disabled rows too. [useCategories](./useCategories.md) filters out disabled categories via [`get_categories_with_words`](../rpc-functions/get_categories_with_words.md)'s `is_active` check; [useAllCategories](./useAllCategories.md) does not filter on `is_active` at all, since tagging a deck should offer every category regardless of browsing visibility (see [categories](../db-schema/categories.md)).

**Key behavior:** Backed by React Query's `useQuery` under query key `['categories', 'managed']`. The `queryFn` selects `id, category_name, is_vocabulary, is_active` ordered by `category_name`. The hook maps `isLoading`/`error`/`data` onto `loading`/`error`/`categories`. Requires a `QueryClientProvider` ancestor (wired once in `main.tsx`). `setCategories` is exposed so the page can apply inline renames and toggles locally after a successful update, by patching the same cache entry.

**Depends on:** [supabase-client](../utils/supabase-client.md), the [`categories`](../db-schema/categories.md) table (read under the authenticated-select policy).

**Used by:** [SuperadminCategoriesPage](../components/SuperadminCategoriesPage.md).

**Tested by:** [docs/tests/useManagedCategories.md](../tests/useManagedCategories.md).
