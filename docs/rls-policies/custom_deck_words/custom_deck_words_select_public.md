# custom_deck_words_select_public

**Table:** [custom_deck_words](../../db-schema/custom_deck_words.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** Any authenticated user can read word links belonging to a published deck. Without this, the word list of a public deck would be invisible to other users, and [`get_random_word_for_category`](../../rpc-functions/get_random_word_for_category.md) (which reads `custom_deck_words` as the caller) would return nothing for a public deck played by a non-owner. Additive to [`custom_deck_words_select_own`](./custom_deck_words_select_own.md).

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "custom_deck_words_select_public" ON "public"."custom_deck_words" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."custom_decks" "cd"
  WHERE (("cd"."id" = "custom_deck_words"."custom_deck_id") AND "cd"."is_public"))));
```
