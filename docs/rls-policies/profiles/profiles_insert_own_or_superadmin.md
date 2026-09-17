# profiles_insert_own_or_superadmin

**Table:** [profiles](../../db-schema/profiles.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** A user can create their own profile row (`user_id = auth.uid()`); a `superadmin` can create a profile for any user.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "profiles_insert_own_or_superadmin" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_superadmin"()));
```
