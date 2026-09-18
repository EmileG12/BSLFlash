# categories_insert_superadmin

**Table:** [categories](../../db-schema/categories.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can create new categories.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "categories_insert_superadmin" ON "public"."categories" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_superadmin"());
```
