# saved_decks_select_own

**Table:** [saved_decks](../../db-schema/saved_decks.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** A user can read only their own saved-deck rows. Private to the saver: no other user can see whose library a deck is in, unlike [`deck_likes`](../../db-schema/deck_likes.md).

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "saved_decks_select_own" ON "public"."saved_decks" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));
```
