-- EditDeckModal's publish toggle used to fire set_custom_deck_public
-- immediately on click, separate from Save -- so a word-list edit made in
-- the same modal session wasn't visible yet to that RPC's "can't publish an
-- empty deck" check (it only saw the persisted word list), producing
-- confusing accept/reject outcomes depending on click order. Folding
-- is_public into update_custom_deck makes privacy part of the same atomic
-- save as the rename + word-list replace, so there's one source of truth
-- (the in-progress form state) and one transaction. update_custom_deck
-- already unconditionally rejects an empty word list before any writes, so
-- that existing guard already satisfies "can't publish an empty deck" --
-- publishing was never reachable with zero words through this RPC to begin
-- with, since the function has never allowed saving zero words at all.
DROP FUNCTION "public"."update_custom_deck"(uuid, text, uuid[]);

CREATE FUNCTION "public"."update_custom_deck"(
  "p_deck_id" uuid,
  "p_name" text,
  "p_word_ids" uuid[],
  "p_is_public" boolean
)
RETURNS void
LANGUAGE plpgsql
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

COMMENT ON FUNCTION "public"."update_custom_deck"(uuid, text, uuid[], boolean) IS 'Renames a custom deck, replaces its word list atomically (full replace, not a diff), and sets its is_public flag. Raises if p_name is blank or p_word_ids is empty (which also rules out publishing an empty deck, since that case is unreachable via this function). Runs under the caller''s RLS -- only the deck''s owner can successfully change anything.';

REVOKE ALL ON FUNCTION "public"."update_custom_deck"(uuid, text, uuid[], boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."update_custom_deck"(uuid, text, uuid[], boolean) FROM "anon";
GRANT ALL ON FUNCTION "public"."update_custom_deck"(uuid, text, uuid[], boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_custom_deck"(uuid, text, uuid[], boolean) TO "service_role";

-- set_custom_deck_public is now redundant -- update_custom_deck covers
-- privacy as part of the same save, and EditDeckModal was its only caller.
DROP FUNCTION "public"."set_custom_deck_public"(uuid, boolean);
