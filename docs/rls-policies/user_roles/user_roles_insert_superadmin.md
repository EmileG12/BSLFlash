# user_roles_insert_superadmin

**Table:** [user_roles](../../db-schema/user_roles.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** Only a `superadmin` can assign a role to a user. Verified live: as the seeded `user` account, an INSERT attempt against `roles` (same pattern) is rejected with HTTP 403.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "user_roles_insert_superadmin" ON "public"."user_roles" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_superadmin"());
```
