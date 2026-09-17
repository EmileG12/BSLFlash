# roles_update_superadmin

**Table:** [roles](../../db-schema/roles.md)
**Command:** UPDATE · **Role:** authenticated

**Purpose:** Only a `superadmin` can update existing roles (e.g. renaming or changing a description).

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "roles_update_superadmin" ON "public"."roles" FOR UPDATE TO "authenticated" USING ("public"."is_superadmin"()) WITH CHECK ("public"."is_superadmin"());
```
