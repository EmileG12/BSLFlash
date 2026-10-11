# word_categories_delete_admin_or_superadmin

**Table:** [word_categories](../../db-schema/word_categories.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** A user holding the `admin` or the `superadmin` role can remove a word-category link. This is the one delete an admin is granted: it lets an admin untag a wrong category from a word they are editing, not only add tags. Checked as `is_superadmin() OR is_admin()` — see [`is_admin()`](../../rpc-functions/is_admin.md).

## Current definition

*Derived from the migrations (`20261011193831_allow_admin_insert_on_word_content_tables.sql`); to be confirmed against `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "word_categories_delete_admin_or_superadmin" ON "public"."word_categories" FOR DELETE TO "authenticated" USING (("public"."is_superadmin"() OR "public"."is_admin"()));
```
