# profiles_select_own_or_superadmin

**Table:** [profiles](../../db-schema/profiles.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** A user can read their own profile row; a `superadmin` can read every profile. Verified live: as `superadmin`, `select * from profiles` returns both seeded users' rows, not just their own.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "profiles_select_own_or_superadmin" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_superadmin"()));
```
