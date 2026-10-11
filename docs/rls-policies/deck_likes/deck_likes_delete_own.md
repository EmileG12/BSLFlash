# deck_likes_delete_own

**Table:** [deck_likes](../../db-schema/deck_likes.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** A user can only remove their own like.

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "deck_likes_delete_own" ON "public"."deck_likes" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));
```
