# user_roles_delete_superadmin

**Table:** [user_roles](../../db-schema/user_roles.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** Only a `superadmin` can revoke a role assignment.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "user_roles_delete_superadmin" ON "public"."user_roles" FOR DELETE TO "authenticated" USING ("public"."is_superadmin"());
```
