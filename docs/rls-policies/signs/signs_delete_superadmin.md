# signs_delete_superadmin

**Table:** [signs](../../db-schema/signs.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can delete sign variants.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "signs_delete_superadmin" ON "public"."signs" FOR DELETE TO "authenticated" USING ("public"."is_superadmin"());
```
