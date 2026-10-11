# custom_deck_words_delete_own

**Table:** [custom_deck_words](../../db-schema/custom_deck_words.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** A user can only remove a word-deck link from a deck they own — same `exists`-against-`custom_decks` check as the other policies on this table. In practice this is rarely hit directly: deleting a whole deck via [`custom_decks_delete_own`](../../rls-policies/custom_decks/custom_decks_delete_own.md) cascades to these rows instead.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "custom_deck_words_delete_own" ON "public"."custom_deck_words" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."custom_decks" "cd"
  WHERE (("cd"."id" = "custom_deck_words"."custom_deck_id") AND ("cd"."user_id" = "auth"."uid"())))));
```
