# profiles_update_own_or_superadmin

**Table:** [profiles](../../db-schema/profiles.md)
**Command:** UPDATE · **Role:** authenticated

**Purpose:** A user can update their own profile row; a `superadmin` can update any profile.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "profiles_update_own_or_superadmin" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_superadmin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_superadmin"()));
```
