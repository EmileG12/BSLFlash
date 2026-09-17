# roles_select_authenticated

**Table:** [roles](../../db-schema/roles.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** Any logged-in user can read every row in `roles`. `roles` is a small, non-sensitive lookup table (just role names/descriptions), so it's readable in full rather than scoped — this is what lets a client resolve a `role_id` (found via [`user_roles_select_own_or_superadmin`](../user_roles/user_roles_select_own_or_superadmin.md)) to a human-readable `role_name` like `superadmin` or `user` right after login.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "roles_select_authenticated" ON "public"."roles" FOR SELECT TO "authenticated" USING (true);
```
