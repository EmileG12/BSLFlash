# word_categories_delete_superadmin

**Table:** [word_categories](../../db-schema/word_categories.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can remove a word-category association.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "word_categories_delete_superadmin" ON "public"."word_categories" FOR DELETE TO "authenticated" USING ("public"."is_superadmin"());
```
