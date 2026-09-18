# words_insert_superadmin

**Table:** [words](../../db-schema/words.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can create new words.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "words_insert_superadmin" ON "public"."words" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_superadmin"());
```
