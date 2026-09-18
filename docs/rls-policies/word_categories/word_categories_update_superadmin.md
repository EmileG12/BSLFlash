# word_categories_update_superadmin

**Table:** [word_categories](../../db-schema/word_categories.md)
**Command:** UPDATE · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can update word-category associations.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "word_categories_update_superadmin" ON "public"."word_categories" FOR UPDATE TO "authenticated" USING ("public"."is_superadmin"()) WITH CHECK ("public"."is_superadmin"());
```
