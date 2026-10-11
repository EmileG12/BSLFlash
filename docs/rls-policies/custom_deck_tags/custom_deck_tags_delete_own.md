# custom_deck_tags_delete_own

**Table:** [custom_deck_tags](../../db-schema/custom_deck_tags.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** Only the owner of a deck can remove a tag from it. Same `exists`-against-`custom_decks` owner check as the insert policy.

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "custom_deck_tags_delete_own" ON "public"."custom_deck_tags" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."custom_decks" "cd"
  WHERE (("cd"."id" = "custom_deck_tags"."custom_deck_id") AND ("cd"."user_id" = "auth"."uid"())))));
```
