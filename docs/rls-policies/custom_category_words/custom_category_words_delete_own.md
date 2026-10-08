# custom_category_words_delete_own

**Table:** [custom_category_words](../../db-schema/custom_category_words.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** A user can only remove a word-deck link from a deck they own — same `exists`-against-`custom_categories` check as the other two policies on this table. In practice this is rarely hit directly: deleting a whole deck via [`custom_categories_delete_own`](../../rls-policies/custom_categories/custom_categories_delete_own.md) cascades to these rows instead.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "custom_category_words_delete_own" ON "public"."custom_category_words" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."custom_categories" "cc"
  WHERE (("cc"."id" = "custom_category_words"."custom_category_id") AND ("cc"."user_id" = "auth"."uid"())))));
```
