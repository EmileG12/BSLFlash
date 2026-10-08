-- create_custom_category previously inserted every id in p_word_ids as-is; a
-- duplicate id would hit custom_category_words' (custom_category_id, word_id)
-- primary key and fail the whole RPC instead of being silently deduped. Not
-- reachable via the current frontend (CreateDeckPage already excludes
-- already-selected words), but the RPC should enforce this invariant itself
-- rather than depending entirely on caller behavior.
CREATE OR REPLACE FUNCTION "public"."create_custom_category"(
  "p_name" text,
  "p_word_ids" uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SET "search_path" TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF btrim(p_name) = '' THEN
    RAISE EXCEPTION 'p_name must not be blank';
  END IF;

  IF p_word_ids IS NULL OR array_length(p_word_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'p_word_ids must contain at least one word';
  END IF;

  INSERT INTO public.custom_categories (category_name)
  VALUES (p_name)
  RETURNING id INTO v_id;

  INSERT INTO public.custom_category_words (custom_category_id, word_id)
  SELECT v_id, word_id FROM unnest(p_word_ids) AS word_id
  ON CONFLICT (custom_category_id, word_id) DO NOTHING;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION "public"."create_custom_category"(text, uuid[]) IS 'Creates a custom deck owned by the calling user (custom_categories.user_id defaults to auth.uid()) with the given name and word links, atomically. Raises if p_name is blank or p_word_ids is empty. Duplicate ids in p_word_ids are silently deduped (ON CONFLICT DO NOTHING) rather than failing the whole call.';
