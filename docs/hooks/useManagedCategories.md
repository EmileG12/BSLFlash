# useManagedCategories

**Path:** `src/hooks/useManagedCategories.ts`
**Signature:** `useManagedCategories(): { categories: ManagedCategory[]; loading: boolean; error: string | null; setCategories: React.Dispatch<React.SetStateAction<ManagedCategory[]>> }`

Where `ManagedCategory` is `{ id: string; category_name: string; is_vocabulary: boolean; is_active: boolean }`.

**Purpose:** Fetches every row of `categories`, including disabled ones, ordered by name, for the superadmin [Categories](../components/SuperadminCategoriesPage.md) page.

**Why a separate hook:** the end-user category hooks ([useCategories](./useCategories.md), [useAllCategories](./useAllCategories.md)) only ever need the categories that are offered for play or tagging, so they select a narrower shape. This hook exists so the management page can see the disabled rows too. Note that the end-user hooks do not currently filter on `is_active` (see [categories](../db-schema/categories.md)).

**Key behavior:** Fetches once on mount, with no refetch. `setCategories` is exposed so the page can apply inline renames and toggles locally after a successful update.

**Depends on:** [supabase-client](../utils/supabase-client.md), the [`categories`](../db-schema/categories.md) table (read under the authenticated-select policy).

**Used by:** [SuperadminCategoriesPage](../components/SuperadminCategoriesPage.md).
