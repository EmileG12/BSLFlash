-- Backs the Edit deck modal's rename + word-list editing. Same atomicity
-- reasoning as create_custom_deck -- a full replace (delete all links, then
-- insert the new set) in one transaction, so a mid-update failure never
-- leaves a half-renamed deck or a half-updated word list. No SECURITY
-- DEFINER: runs under the caller's RLS, so custom_decks_update_own /
-- custom_deck_words' owner-gated policies enforce that only the deck's
-- owner can successfully change anything (a non-owner's call is a silent
-- no-op update plus zero affected word rows, same as any other owner-only
-- RLS-gated write in this schema).
CREATE OR REPLACE FUNCTION "public"."update_custom_deck"(
  "p_deck_id" uuid,
  "p_name" text,
  "p_word_ids" uuid[]
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
  SET deck_name = p_name
  WHERE id = p_deck_id;

  DELETE FROM public.custom_deck_words WHERE custom_deck_id = p_deck_id;

  INSERT INTO public.custom_deck_words (custom_deck_id, word_id)
  SELECT p_deck_id, word_id FROM unnest(p_word_ids) AS word_id
  ON CONFLICT (custom_deck_id, word_id) DO NOTHING;
END;
$$;

COMMENT ON FUNCTION "public"."update_custom_deck"(uuid, text, uuid[]) IS 'Renames a custom deck and replaces its word list atomically (full replace, not a diff). Raises if p_name is blank or p_word_ids is empty. Runs under the caller''s RLS -- only the deck''s owner can successfully change anything.';

REVOKE ALL ON FUNCTION "public"."update_custom_deck"(uuid, text, uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."update_custom_deck"(uuid, text, uuid[]) FROM "anon";
GRANT ALL ON FUNCTION "public"."update_custom_deck"(uuid, text, uuid[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_custom_deck"(uuid, text, uuid[]) TO "service_role";
