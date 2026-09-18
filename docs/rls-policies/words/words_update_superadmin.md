# words_update_superadmin

**Table:** [words](../../db-schema/words.md)
**Command:** UPDATE · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can update existing words.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "words_update_superadmin" ON "public"."words" FOR UPDATE TO "authenticated" USING ("public"."is_superadmin"()) WITH CHECK ("public"."is_superadmin"());
```
