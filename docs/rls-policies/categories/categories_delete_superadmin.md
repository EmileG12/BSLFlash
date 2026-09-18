# categories_delete_superadmin

**Table:** [categories](../../db-schema/categories.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can delete categories.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "categories_delete_superadmin" ON "public"."categories" FOR DELETE TO "authenticated" USING ("public"."is_superadmin"());
```
