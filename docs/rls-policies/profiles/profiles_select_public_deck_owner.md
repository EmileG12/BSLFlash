# profiles_select_public_deck_owner

**Table:** [profiles](../../db-schema/profiles.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** A profile is readable by any authenticated user if that profile's owner has at least one published custom deck. This is what lets [BrowseDecksPage](../../components/BrowseDecksPage.md) show "by @username" for a public deck's creator. It is narrow by design: a user's profile is not readable merely because they exist, only once they are publishing a deck. Additive to [`profiles_select_own_or_superadmin`](./profiles_select_own_or_superadmin.md).

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE POLICY "profiles_select_public_deck_owner" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."custom_decks" "cd"
  WHERE (("cd"."user_id" = "profiles"."user_id") AND "cd"."is_public"))));
```
