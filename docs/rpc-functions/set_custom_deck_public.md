# set_custom_deck_public

**Signature:** `public.set_custom_deck_public(p_deck_id uuid, p_is_public boolean) RETURNS void`
**Language:** plpgsql
**Last touched by migration:** [`20261011185141_raise_on_set_custom_deck_public_non_owner.sql`](../../supabase/migrations/20261011185141_raise_on_set_custom_deck_public_non_owner.sql)

**Purpose:** Toggles a [`custom_decks`](../db-schema/custom_decks.md) row's `is_public` flag, which controls whether the deck appears in the public directory ([BrowseDecksPage](../components/BrowseDecksPage.md)). Guards beyond ownership: a deck with zero words cannot be published, since it would appear in the directory and could not be played.

Raises `Deck not found or not owned by caller` when the caller doesn't own `p_deck_id`. Raises `Cannot publish a deck with no words` when `p_is_public` is `true` and the deck has no [`custom_deck_words`](../db-schema/custom_deck_words.md) rows. Unpublishing has no word-count check.

Not `SECURITY DEFINER`: it runs as the caller, so the owner-only [`custom_decks_update_own`](../rls-policies/custom_decks/custom_decks_update_own.md) policy still governs the update regardless. The explicit ownership check above exists so a non-owner's call raises instead of silently affecting zero rows — added by review, since [EditDeckModal](../components/EditDeckModal.md)'s toggle flips its local state on `error === null` without checking rows-affected, and a silent no-op would have shown the wrong published state until reload.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly — same local-environment default-grant pattern as every other function here.
- `EXECUTE` granted to `authenticated` only (and `service_role`).

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION "public"."set_custom_deck_public"("p_deck_id" "uuid", "p_is_public" boolean) RETURNS void
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.custom_decks WHERE id = p_deck_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Deck not found or not owned by caller';
  END IF;

  IF p_is_public AND NOT EXISTS (
    SELECT 1 FROM public.custom_deck_words WHERE custom_deck_id = p_deck_id
  ) THEN
    RAISE EXCEPTION 'Cannot publish a deck with no words';
  END IF;

  UPDATE public.custom_decks
  SET is_public = p_is_public
  WHERE id = p_deck_id;
END;
$$;

COMMENT ON FUNCTION "public"."set_custom_deck_public"("p_deck_id" "uuid", "p_is_public" boolean) IS 'Toggles a custom deck''s is_public flag. Raises if the caller doesn''t own the deck, or if trying to publish a deck with zero words.';

REVOKE ALL ON FUNCTION "public"."set_custom_deck_public"("p_deck_id" "uuid", "p_is_public" boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."set_custom_deck_public"("p_deck_id" "uuid", "p_is_public" boolean) FROM "anon";
GRANT ALL ON FUNCTION "public"."set_custom_deck_public"("p_deck_id" "uuid", "p_is_public" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_custom_deck_public"("p_deck_id" "uuid", "p_is_public" boolean) TO "service_role";
```

**Used by:** [EditDeckModal](../components/EditDeckModal.md) (the Published/Unpublished toggle, which calls this immediately rather than on Save).
