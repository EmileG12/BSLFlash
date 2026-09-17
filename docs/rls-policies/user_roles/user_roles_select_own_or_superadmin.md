# user_roles_select_own_or_superadmin

**Table:** [user_roles](../../db-schema/user_roles.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** A user can read their own role assignment row(s) (`user_id = auth.uid()`); a `superadmin` can read every row (needed for future role-management UI). This is what lets the client discover which `role_id`(s) the logged-in user has right after login. Verified live: as the seeded `user` account, `select * from user_roles` returns exactly one row (their own); as `superadmin`, it returns all rows.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "user_roles_select_own_or_superadmin" ON "public"."user_roles" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_superadmin"()));
```
