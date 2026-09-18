# categories_update_superadmin

**Table:** [categories](../../db-schema/categories.md)
**Command:** UPDATE · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can update existing categories.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "categories_update_superadmin" ON "public"."categories" FOR UPDATE TO "authenticated" USING ("public"."is_superadmin"()) WITH CHECK ("public"."is_superadmin"());
```
