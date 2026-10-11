# deck_likes_select_visible

**Table:** [deck_likes](../../db-schema/deck_likes.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** Any authenticated user can read likes on a deck they can already see (their own, or any published deck). This is deliberately wider than [`saved_decks_select_own`](../saved_decks/saved_decks_select_own.md): like counts and per-user likes are a public signal the directory displays.

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "deck_likes_select_visible" ON "public"."deck_likes" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."custom_decks" "cd"
  WHERE (("cd"."id" = "deck_likes"."custom_deck_id") AND (("cd"."user_id" = "auth"."uid"()) OR "cd"."is_public")))));
```
