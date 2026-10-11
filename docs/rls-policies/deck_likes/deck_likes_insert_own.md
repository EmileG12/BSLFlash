# deck_likes_insert_own

**Table:** [deck_likes](../../db-schema/deck_likes.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** A user can only add a like as themselves (`user_id = auth.uid()`), AND only on a deck they can actually see (own, or published) — added by review to close the same gap as [`saved_decks_insert_own`](../saved_decks/saved_decks_insert_own.md): without it, a user who somehow learned another user's *private* deck id could insert a phantom like row for it.

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "deck_likes_insert_own" ON "public"."deck_likes" FOR INSERT TO "authenticated" WITH CHECK (
  ("user_id" = "auth"."uid"())
  AND EXISTS (
    SELECT 1 FROM "public"."custom_decks" "cd"
    WHERE "cd"."id" = "deck_likes"."custom_deck_id"
      AND ("cd"."user_id" = "auth"."uid"() OR "cd"."is_public")
  )
);
```
