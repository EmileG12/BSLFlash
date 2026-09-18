# signs_update_superadmin

**Table:** [signs](../../db-schema/signs.md)
**Command:** UPDATE · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can update existing sign variants.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "signs_update_superadmin" ON "public"."signs" FOR UPDATE TO "authenticated" USING ("public"."is_superadmin"()) WITH CHECK ("public"."is_superadmin"());
```
