# saved_decks_insert_own

**Table:** [saved_decks](../../db-schema/saved_decks.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** A user can only save a deck to their own library (`user_id = auth.uid()`), AND only a deck they can actually see (own, or published) — the second half closes a gap caught by review: without it, a user who somehow learned another user's *private* deck id could insert a phantom save row for it (the FK only requires the id to exist, not that it's visible). Saves are issued from [BrowseDecksPage](../../components/BrowseDecksPage.md), which only offers the save action on decks it has listed, but the policy no longer relies on that alone.

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "saved_decks_insert_own" ON "public"."saved_decks" FOR INSERT TO "authenticated" WITH CHECK (
  ("user_id" = "auth"."uid"())
  AND EXISTS (
    SELECT 1 FROM "public"."custom_decks" "cd"
    WHERE "cd"."id" = "saved_decks"."custom_deck_id"
      AND ("cd"."user_id" = "auth"."uid"() OR "cd"."is_public")
  )
);
```
