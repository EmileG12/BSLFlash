# custom_deck_words_select_own

**Table:** [custom_deck_words](../../db-schema/custom_deck_words.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** A user can read a word-deck link if they own the parent `custom_decks` row — there's no `user_id` on this table itself to check directly, so ownership is checked via an `exists` subquery against `custom_decks`. Public decks are readable through the additive [`custom_deck_words_select_public`](./custom_deck_words_select_public.md).

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "custom_deck_words_select_own" ON "public"."custom_deck_words" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."custom_decks" "cd"
  WHERE (("cd"."id" = "custom_deck_words"."custom_deck_id") AND ("cd"."user_id" = "auth"."uid"())))));
```
