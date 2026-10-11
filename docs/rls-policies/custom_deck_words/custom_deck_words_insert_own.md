# custom_deck_words_insert_own

**Table:** [custom_deck_words](../../db-schema/custom_deck_words.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** A user can only link a word into a deck they own — the same `exists`-against-`custom_decks` check as the select policy, applied as a `WITH CHECK`. This is what lets [`create_custom_deck`](../../rpc-functions/create_custom_deck.md) (not `SECURITY DEFINER`) insert the junction rows as the calling user with no extra ownership check needed in the function body: the deck it just created in the same transaction is already owned by `auth.uid()`, so this policy passes. [`update_custom_deck`](../../rpc-functions/update_custom_deck.md) relies on the same check for the links it re-inserts; for a non-owner, this `WITH CHECK` is what makes that call raise rather than succeed silently.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "custom_deck_words_insert_own" ON "public"."custom_deck_words" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."custom_decks" "cd"
  WHERE (("cd"."id" = "custom_deck_words"."custom_deck_id") AND ("cd"."user_id" = "auth"."uid"())))));
```
