# words_delete_superadmin

**Table:** [words](../../db-schema/words.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can delete words.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "words_delete_superadmin" ON "public"."words" FOR DELETE TO "authenticated" USING ("public"."is_superadmin"());
```
