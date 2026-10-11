# saved_decks_delete_own

**Table:** [saved_decks](../../db-schema/saved_decks.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** A user can only remove a deck from their own library. Unsaving never touches the deck itself or its [`deck_likes`](../../db-schema/deck_likes.md) rows.

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "saved_decks_delete_own" ON "public"."saved_decks" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));
```
