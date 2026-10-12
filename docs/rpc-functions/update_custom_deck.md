# update_custom_deck

**Signature:** `public.update_custom_deck(p_deck_id uuid, p_name text, p_word_ids uuid[], p_is_public boolean) RETURNS void`
**Language:** plpgsql
**Last touched by migration:** [`20261012190408_fold_is_public_into_update_custom_deck.sql`](../../supabase/migrations/20261012190408_fold_is_public_into_update_custom_deck.sql)

**Purpose:** Renames a [`custom_decks`](../db-schema/custom_decks.md) row, replaces its entire word list, and sets its `is_public` flag, all in one call. Used by the Save action of [EditDeckModal](../components/EditDeckModal.md). The word list is a full replace, not a diff: every existing [`custom_deck_words`](../db-schema/custom_deck_words.md) link for the deck is deleted, then `p_word_ids` is inserted.

Publish state is part of this call, not a separate RPC, so the name, the word list, and the publish flag are saved together. Raises if `p_name` is blank (`btrim(p_name) = ''`) or `p_word_ids` is null/empty, both checked before any write. Because the word-list check runs on every call, a deck with no words cannot be published through this function, regardless of `p_is_public`.

Written in `plpgsql` so the rename, the publish flag, the delete, and the re-insert run in one transaction. A mid-update failure cannot leave a half-renamed deck, a deck with only some of its words linked, or a publish flag that does not match the saved words, the same reasoning as [`create_custom_deck`](./create_custom_deck.md).

A duplicate id in `p_word_ids` is silently deduped (`ON CONFLICT (custom_deck_id, word_id) DO NOTHING`), as in `create_custom_deck`.

Tags are not touched by this function. [EditDeckModal](../components/EditDeckModal.md) writes tag changes separately, directly against [`custom_deck_tags`](../db-schema/custom_deck_tags.md), after this call returns. The rename, word list, and publish flag are therefore committed even if that later tag write fails.

Not `SECURITY DEFINER`: it runs as the calling user, so the owner-gated RLS policies apply. The `UPDATE` on `custom_decks` (which sets `deck_name` and `is_public`) is gated by [`custom_decks_update_own`](../rls-policies/custom_decks/custom_decks_update_own.md), and the `DELETE`/`INSERT` on `custom_deck_words` by [`custom_deck_words_delete_own`](../rls-policies/custom_deck_words/custom_deck_words_delete_own.md) and [`custom_deck_words_insert_own`](../rls-policies/custom_deck_words/custom_deck_words_insert_own.md).

A non-owner's call does not succeed silently. The `UPDATE` and `DELETE` match zero rows, but the `INSERT` fails its `WITH CHECK`, which raises a row-level-security error and rolls back the whole call.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly, same local-environment default-grant pattern as every other function here (see [`is_superadmin`](./is_superadmin.md)).
- `EXECUTE` granted to `authenticated` only (and `service_role`).

## Current definition

*Live dump via `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION "public"."update_custom_deck"("p_deck_id" "uuid", "p_name" "text", "p_word_ids" "uuid"[], "p_is_public" boolean) RETURNS "void"
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
  SET deck_name = p_name,
      is_public = p_is_public
  WHERE id = p_deck_id;

  DELETE FROM public.custom_deck_words WHERE custom_deck_id = p_deck_id;

  INSERT INTO public.custom_deck_words (custom_deck_id, word_id)
  SELECT p_deck_id, word_id FROM unnest(p_word_ids) AS word_id
  ON CONFLICT (custom_deck_id, word_id) DO NOTHING;
END;
$$;

COMMENT ON FUNCTION "public"."update_custom_deck"("p_deck_id" "uuid", "p_name" "text", "p_word_ids" "uuid"[], "p_is_public" boolean) IS 'Renames a custom deck, replaces its word list atomically (full replace, not a diff), and sets its is_public flag. Raises if p_name is blank or p_word_ids is empty (which also rules out publishing an empty deck, since that case is unreachable via this function). Runs under the caller''s RLS -- only the deck''s owner can successfully change anything.';

REVOKE ALL ON FUNCTION "public"."update_custom_deck"("p_deck_id" "uuid", "p_name" "text", "p_word_ids" "uuid"[], "p_is_public" boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."update_custom_deck"("p_deck_id" "uuid", "p_name" "text", "p_word_ids" "uuid"[], "p_is_public" boolean) FROM "anon";
GRANT ALL ON FUNCTION "public"."update_custom_deck"("p_deck_id" "uuid", "p_name" "text", "p_word_ids" "uuid"[], "p_is_public" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_custom_deck"("p_deck_id" "uuid", "p_name" "text", "p_word_ids" "uuid"[], "p_is_public" boolean) TO "service_role";
```

**Used by:** [EditDeckModal](../components/EditDeckModal.md).
