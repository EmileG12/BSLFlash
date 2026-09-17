# profiles_delete_own_or_superadmin

**Table:** [profiles](../../db-schema/profiles.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** A user can delete their own profile row; a `superadmin` can delete any profile.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "profiles_delete_own_or_superadmin" ON "public"."profiles" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_superadmin"()));
```
