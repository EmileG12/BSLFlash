# custom_decks_delete_own

**Table:** [custom_decks](../../db-schema/custom_decks.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** A user can only delete their own custom decks. Backs [MyDecksPage](../../components/MyDecksPage.md)'s delete action (`supabase.from('custom_decks').delete().eq('id', ...)`) — deleting the header row cascades to its [`custom_deck_words`](../../db-schema/custom_deck_words.md), [`custom_deck_tags`](../../db-schema/custom_deck_tags.md), [`saved_decks`](../../db-schema/saved_decks.md) and [`deck_likes`](../../db-schema/deck_likes.md) rows via their `ON DELETE CASCADE`.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "custom_decks_delete_own" ON "public"."custom_decks" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));
```
