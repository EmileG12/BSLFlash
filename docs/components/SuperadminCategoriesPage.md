# SuperadminCategoriesPage

**Path:** `src/pages/SuperadminCategoriesPage.tsx` · **Route:** `/superadmin/categories` (behind [SuperadminRoute](./SuperadminRoute.md))

**Purpose:** Creates categories and manages the existing ones. Lists every row of `categories`, including disabled ones.

**Key behavior:**
- **Create** inserts a `categories` row with a name and an `is_vocabulary` switch (default off). The name is trimmed, and an empty name disables the button.
- **Inline rename** is saved with a single `update` on `category_name`. A blank or unchanged name is discarded without a request.
- **Two toggles per row:** `is_vocabulary` (which kind of grouping the category is) and `is_active`. Each writes straight to the row and updates local state on success. A disabled category's name is greyed out and labelled.
- **Errors** from row updates (rename and toggles) share one message on the page. Create errors show in the create card.
- Admins have no access to this page: `categories` has no admin write policy.

`is_active` is stored and toggled here, but no browsing query reads it yet. See [categories](../db-schema/categories.md).

**Depends on:** [useManagedCategories](../hooks/useManagedCategories.md), [supabase-client](../utils/supabase-client.md), `Card`/`Input`/`Switch`/`Badge`/`Table`/`Button` from `src/components/ui/`.

**Used by:** the `/superadmin/categories` route in `src/App.tsx`, linked from the superadmin section of [NavBar](./NavBar.md) and [MobileNavSheet](./MobileNavSheet.md).
