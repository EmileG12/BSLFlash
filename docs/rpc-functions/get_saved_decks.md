# get_saved_decks

**Signature:** `public.get_saved_decks() RETURNS TABLE(id uuid, deck_name text, owner_user_id uuid, owner_name text)`
**Language:** SQL
**Last touched by migration:** [`20261011163807_create_get_saved_decks_function.sql`](../../supabase/migrations/20261011163807_create_get_saved_decks_function.sql)

**Purpose:** Lists the calling user's library: their [`saved_decks`](../db-schema/saved_decks.md) rows joined to the current [`custom_decks`](../db-schema/custom_decks.md) row for each, with the owner's name from [`profiles`](../db-schema/profiles.md). Backs the "Saved Decks" section of [MyDecksPage](../components/MyDecksPage.md) via [useSavedDecks](../hooks/useSavedDecks.md). Ordered by deck name.

A save whose deck the owner has since unpublished produces no row. The join goes through `custom_decks` under the caller's RLS, and [`custom_decks_select_public`](../rls-policies/custom_decks/custom_decks_select_public.md) no longer matches that deck, so the joined row is dropped. Nothing is written to `saved_decks` on unpublish, so the save reappears here automatically if the owner republishes. The function needs no `is_public` check of its own.

`STABLE`: no volatile calls.

Not `SECURITY DEFINER`: it runs as the caller. `WHERE sd.user_id = auth.uid()` limits the result to the caller's own saves, and `saved_decks`' own-row policy would also limit it.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly — same local-environment default-grant quirk as every other function here.
- `EXECUTE` granted to `authenticated` only (and `service_role`).

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION "public"."get_saved_decks"() RETURNS TABLE("id" "uuid", "deck_name" "text", "owner_user_id" "uuid", "owner_name" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT cd.id, cd.deck_name, cd.user_id AS owner_user_id, p.user_name AS owner_name
  FROM public.saved_decks sd
  JOIN public.custom_decks cd ON cd.id = sd.custom_deck_id
  LEFT JOIN public.profiles p ON p.user_id = cd.user_id
  WHERE sd.user_id = auth.uid()
  ORDER BY cd.deck_name;
$$;

COMMENT ON FUNCTION "public"."get_saved_decks"() IS 'Lists the calling user''s saved decks (public.saved_decks) joined to their current custom_decks row. A deck the owner has since unpublished produces no row here (excluded by custom_decks'' own RLS under invoker rights), reappearing automatically if the owner republishes -- saved_decks itself is never touched by unpublishing.';

REVOKE ALL ON FUNCTION "public"."get_saved_decks"() FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_saved_decks"() FROM "anon";
GRANT ALL ON FUNCTION "public"."get_saved_decks"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_saved_decks"() TO "service_role";
```

**Used by:** [useSavedDecks](../hooks/useSavedDecks.md).
