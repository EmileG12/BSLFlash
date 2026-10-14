# signs_insert_admin_or_superadmin

**Table:** [signs](../../db-schema/signs.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** A user holding the `admin` or the `superadmin` role can create a sign variant. In practice this is the first variant an admin creates alongside a new word (which is then marked `is_primary`). Adding further variants to an existing word is superadmin-only in the UI, but this policy does not itself restrict that. Checked as `is_superadmin() OR is_admin()` — see [`is_admin()`](../../rpc-functions/is_admin.md).

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "signs_insert_admin_or_superadmin" ON "public"."signs" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_superadmin"() OR "public"."is_admin"()));
```
