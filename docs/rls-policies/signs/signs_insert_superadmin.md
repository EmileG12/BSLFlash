# signs_insert_superadmin

**Table:** [signs](../../db-schema/signs.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can create new sign variants.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "signs_insert_superadmin" ON "public"."signs" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_superadmin"());
```
