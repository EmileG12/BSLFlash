# word_categories_insert_admin_or_superadmin

**Table:** [word_categories](../../db-schema/word_categories.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** A user holding the `admin` or the `superadmin` role can link a word to a category, so an admin adding a word can tag it into existing categories. Checked as `is_superadmin() OR is_admin()` — see [`is_admin()`](../../rpc-functions/is_admin.md) for why the two are composed rather than one implying the other. Admins cannot create categories; that stays on [`categories`](../../db-schema/categories.md).

## Current definition

*Derived from the migrations (`20261011193831_allow_admin_insert_on_word_content_tables.sql`); to be confirmed against `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "word_categories_insert_admin_or_superadmin" ON "public"."word_categories" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_superadmin"() OR "public"."is_admin"()));
```
