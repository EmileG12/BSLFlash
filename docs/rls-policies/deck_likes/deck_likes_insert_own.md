# deck_likes_insert_own

**Table:** [deck_likes](../../db-schema/deck_likes.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** A user can only add a like as themselves (`user_id = auth.uid()`). Like rows are not checked against the deck's ownership or publish state here.

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "deck_likes_insert_own" ON "public"."deck_likes" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));
```
