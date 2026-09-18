# word_categories_insert_superadmin

**Table:** [word_categories](../../db-schema/word_categories.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can link a word to a category.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "word_categories_insert_superadmin" ON "public"."word_categories" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_superadmin"());
```
