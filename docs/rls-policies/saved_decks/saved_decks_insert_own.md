# saved_decks_insert_own

**Table:** [saved_decks](../../db-schema/saved_decks.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** A user can only save a deck to their own library (`user_id = auth.uid()`). The policy checks only the saving user; it does not itself check that the target `custom_deck_id` is published. Saves are issued from [BrowseDecksPage](../../components/BrowseDecksPage.md), which only offers the save action on decks it has listed.

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "saved_decks_insert_own" ON "public"."saved_decks" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));
```
