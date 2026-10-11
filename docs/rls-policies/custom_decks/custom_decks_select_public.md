# custom_decks_select_public

**Table:** [custom_decks](../../db-schema/custom_decks.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** Any authenticated user can read a custom deck that its owner has published (`is_public = true`). This is what lets [BrowseDecksPage](../../components/BrowseDecksPage.md) list other users' decks and lets a deck be played from `/flashcards/custom/:id`. It is additive to [`custom_decks_select_own`](./custom_decks_select_own.md): a row is readable if either policy matches. Unpublishing removes the match, which hides the deck from everyone except its owner, and does not touch [`saved_decks`](../../db-schema/saved_decks.md) or [`deck_likes`](../../db-schema/deck_likes.md) rows.

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "custom_decks_select_public" ON "public"."custom_decks" FOR SELECT TO "authenticated" USING ("is_public");
```
