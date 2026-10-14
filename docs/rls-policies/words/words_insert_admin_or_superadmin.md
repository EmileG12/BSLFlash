# words_insert_admin_or_superadmin

**Table:** [words](../../db-schema/words.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** A user holding the `admin` or the `superadmin` role can create new words. Checked as `is_superadmin() OR is_admin()` because [`is_admin()`](../../rpc-functions/is_admin.md) does not return true for superadmins — the two checks must be composed explicitly. Admins only ever insert; update and delete on `words` stay superadmin-only.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "words_insert_admin_or_superadmin" ON "public"."words" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_superadmin"() OR "public"."is_admin"()));
```
