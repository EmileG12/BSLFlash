# custom_category_words_select_own

**Table:** [custom_category_words](../../db-schema/custom_category_words.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** A user can read a word-deck link only if they own the parent `custom_categories` row — there's no `user_id` on this table itself to check directly, so ownership is checked via an `exists` subquery against `custom_categories`.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "custom_category_words_select_own" ON "public"."custom_category_words" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."custom_categories" "cc"
  WHERE (("cc"."id" = "custom_category_words"."custom_category_id") AND ("cc"."user_id" = "auth"."uid"())))));
```
