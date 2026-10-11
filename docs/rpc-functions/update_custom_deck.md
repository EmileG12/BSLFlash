# update_custom_deck

**Signature:** `public.update_custom_deck(p_deck_id uuid, p_name text, p_word_ids uuid[]) RETURNS void`
**Language:** plpgsql
**Last touched by migration:** [`20261011164402_create_update_custom_deck_function.sql`](../../supabase/migrations/20261011164402_create_update_custom_deck_function.sql)

**Purpose:** Renames a [`custom_decks`](../db-schema/custom_decks.md) row and replaces its entire word list in one call. Used by the Save action of [EditDeckModal](../components/EditDeckModal.md). The word list is a full replace, not a diff: every existing [`custom_deck_words`](../db-schema/custom_deck_words.md) link for the deck is deleted, then `p_word_ids` is inserted.

Raises if `p_name` is blank (`btrim(p_name) = ''`) or `p_word_ids` is null/empty, both checked before any write.

Written in `plpgsql` so the rename, the delete, and the re-insert run in one transaction. A mid-update failure cannot leave a half-renamed deck or a deck with only some of its words linked, the same reasoning as [`create_custom_deck`](./create_custom_deck.md).

A duplicate id in `p_word_ids` is silently deduped (`ON CONFLICT (custom_deck_id, word_id) DO NOTHING`), as in `create_custom_deck`.

Tags are not touched by this function. [EditDeckModal](../components/EditDeckModal.md) writes tag changes separately, directly against [`custom_deck_tags`](../db-schema/custom_deck_tags.md), after this call returns. The rename and word list are therefore committed even if that later tag write fails.

Not `SECURITY DEFINER`: it runs as the calling user, so the owner-gated RLS policies apply. The `UPDATE` on `custom_decks` is gated by [`custom_decks_update_own`](../rls-policies/custom_decks/custom_decks_update_own.md), and the `DELETE`/`INSERT` on `custom_deck_words` by [`custom_deck_words_delete_own`](../rls-policies/custom_deck_words/custom_deck_words_delete_own.md) and [`custom_deck_words_insert_own`](../rls-policies/custom_deck_words/custom_deck_words_insert_own.md).

A non-owner's call does not succeed silently. The `UPDATE` and `DELETE` match zero rows, but the `INSERT` fails its `WITH CHECK`, which raises a row-level-security error and rolls back the whole call. This differs from [`set_custom_deck_public`](./set_custom_deck_public.md), which has no insert step and so returns with no error and no row changed for a non-owner.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly, same local-environment default-grant pattern as every other function here (see [`is_superadmin`](./is_superadmin.md)).
- `EXECUTE` granted to `authenticated` only (and `service_role`).

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION "public"."update_custom_deck"("p_deck_id" "uuid", "p_name" "text", "p_word_ids" "uuid"[]) RETURNS void
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF btrim(p_name) = '' THEN
    RAISE EXCEPTION 'p_name must not be blank';
  END IF;

  IF p_word_ids IS NULL OR array_length(p_word_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'p_word_ids must contain at least one word';
  END IF;

  UPDATE public.custom_decks
  SET deck_name = p_name
  WHERE id = p_deck_id;

  DELETE FROM public.custom_deck_words WHERE custom_deck_id = p_deck_id;

  INSERT INTO public.custom_deck_words (custom_deck_id, word_id)
  SELECT p_deck_id, word_id FROM unnest(p_word_ids) AS word_id
  ON CONFLICT (custom_deck_id, word_id) DO NOTHING;
END;
$$;

COMMENT ON FUNCTION "public"."update_custom_deck"(uuid, text, uuid[]) IS 'Renames a custom deck and replaces its word list atomically (full replace, not a diff). Raises if p_name is blank or p_word_ids is empty. Runs under the caller''s RLS -- only the deck''s owner can successfully change anything.';

REVOKE ALL ON FUNCTION "public"."update_custom_deck"("p_deck_id" "uuid", "p_name" "text", "p_word_ids" "uuid"[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."update_custom_deck"("p_deck_id" "uuid", "p_name" "text", "p_word_ids" "uuid"[]) FROM "anon";
GRANT ALL ON FUNCTION "public"."update_custom_deck"("p_deck_id" "uuid", "p_name" "text", "p_word_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_custom_deck"("p_deck_id" "uuid", "p_name" "text", "p_word_ids" "uuid"[]) TO "service_role";
```

**Used by:** [EditDeckModal](../components/EditDeckModal.md).
