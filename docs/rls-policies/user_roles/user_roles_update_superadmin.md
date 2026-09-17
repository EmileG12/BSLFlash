# user_roles_update_superadmin

**Table:** [user_roles](../../db-schema/user_roles.md)
**Command:** UPDATE · **Role:** authenticated

**Purpose:** Only a `superadmin` can change an existing role assignment.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "user_roles_update_superadmin" ON "public"."user_roles" FOR UPDATE TO "authenticated" USING ("public"."is_superadmin"()) WITH CHECK ("public"."is_superadmin"());
```
