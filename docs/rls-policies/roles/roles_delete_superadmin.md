# roles_delete_superadmin

**Table:** [roles](../../db-schema/roles.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** Only a `superadmin` can delete a role. Note `user_roles.role_id` has `ON DELETE RESTRICT`, so this will fail at the FK level if any `user_roles` rows still reference the role.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "roles_delete_superadmin" ON "public"."roles" FOR DELETE TO "authenticated" USING ("public"."is_superadmin"());
```
