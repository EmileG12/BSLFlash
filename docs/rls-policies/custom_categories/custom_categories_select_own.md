# custom_categories_select_own

**Table:** [custom_categories](../../db-schema/custom_categories.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** A user can read only their own custom decks — unlike [categories](../categories/categories_select_authenticated.md), this is user-owned data, not shared reference content.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "custom_categories_select_own" ON "public"."custom_categories" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));
```
