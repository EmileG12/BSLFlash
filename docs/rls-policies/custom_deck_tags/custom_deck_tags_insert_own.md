# custom_deck_tags_insert_own

**Table:** [custom_deck_tags](../../db-schema/custom_deck_tags.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** Only the owner of a deck can tag it. The check is an `exists` against `custom_decks` requiring `user_id = auth.uid()`, so tagging a public deck owned by someone else is rejected.

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "custom_deck_tags_insert_own" ON "public"."custom_deck_tags" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."custom_decks" "cd"
  WHERE (("cd"."id" = "custom_deck_tags"."custom_deck_id") AND ("cd"."user_id" = "auth"."uid"())))));
```
