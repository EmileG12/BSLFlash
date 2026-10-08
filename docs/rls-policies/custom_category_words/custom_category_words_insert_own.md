# custom_category_words_insert_own

**Table:** [custom_category_words](../../db-schema/custom_category_words.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** A user can only link a word into a deck they own — the same `exists`-against-`custom_categories` check as the select policy, applied as a `WITH CHECK`. This is what lets [`create_custom_category`](../../rpc-functions/create_custom_category.md) (not `SECURITY DEFINER`) insert the junction rows as the calling user with no extra ownership check needed in the function body: the deck it just created in the same transaction is already owned by `auth.uid()`, so this policy passes.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "custom_category_words_insert_own" ON "public"."custom_category_words" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."custom_categories" "cc"
  WHERE (("cc"."id" = "custom_category_words"."custom_category_id") AND ("cc"."user_id" = "auth"."uid"())))));
```
