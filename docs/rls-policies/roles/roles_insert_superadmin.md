# roles_insert_superadmin

**Table:** [roles](../../db-schema/roles.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can create new roles.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "roles_insert_superadmin" ON "public"."roles" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_superadmin"());
```
