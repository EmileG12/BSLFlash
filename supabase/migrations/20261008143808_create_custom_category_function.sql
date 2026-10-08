-- Creates a custom deck (header row + all word links) in a single
-- transaction, so a mid-insert failure never leaves an orphaned empty deck
-- or a deck with only some of its words. No SECURITY DEFINER: this runs as
-- the calling user, so the custom_categories/custom_category_words RLS
-- policies (ownership via user_id = auth.uid()) apply exactly as if the two
-- inserts had been issued directly -- a user can only ever create a deck for
-- themselves, same as the row default on custom_categories.user_id.
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
  SELECT v_id, word_id FROM unnest(p_word_ids) AS word_id;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION "public"."create_custom_category"(text, uuid[]) IS 'Creates a custom deck owned by the calling user (custom_categories.user_id defaults to auth.uid()) with the given name and word links, atomically. Raises if p_name is blank or p_word_ids is empty.';

REVOKE ALL ON FUNCTION "public"."create_custom_category"(text, uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."create_custom_category"(text, uuid[]) FROM "anon";
GRANT ALL ON FUNCTION "public"."create_custom_category"(text, uuid[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_custom_category"(text, uuid[]) TO "service_role";
