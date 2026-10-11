# custom_deck_tags_select_visible

**Table:** [custom_deck_tags](../../db-schema/custom_deck_tags.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** A tag link is readable whenever its parent deck is visible to the caller — their own deck, or any published deck. Mirrors the shape of [`custom_deck_words_select_own`](../custom_deck_words/custom_deck_words_select_own.md) plus its public counterpart, combined into one policy here.

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "custom_deck_tags_select_visible" ON "public"."custom_deck_tags" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."custom_decks" "cd"
  WHERE (("cd"."id" = "custom_deck_tags"."custom_deck_id") AND (("cd"."user_id" = "auth"."uid"()) OR "cd"."is_public")))));
```
