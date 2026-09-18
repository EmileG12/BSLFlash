-- Returns one random word (+ its primary sign video) belonging to the given
-- category. Only words with a sign that has an is_primary=true video are
-- eligible (INNER JOIN, not LEFT JOIN) -- words without a primary video can
-- never be drawn. Returns zero rows if the category has no eligible words
-- (not an error) -- callers handle "no rows" as an empty-category state.
-- Deliberately no "exclude last word" param: immediate repeats from a
-- plain random draw are an acceptable, expected outcome for a drill feature,
-- not a bug -- kept simple on purpose.
CREATE OR REPLACE FUNCTION "public"."get_random_word_for_category"("category_id" uuid)
RETURNS TABLE (
  "word_id" uuid,
  "word" text,
  "definition" text,
  "storage_path" text,
  "format" text
)
LANGUAGE "sql"
SET "search_path" TO 'public'
AS $$
  SELECT
    w.id AS word_id,
    w.word,
    w.definition,
    sv.storage_path,
    sv.format
  FROM public.word_categories wc
  JOIN public.words w ON w.id = wc.word_id
  JOIN public.signs s ON s.word_id = w.id
  JOIN public.sign_videos sv ON sv.sign_id = s.id AND sv.is_primary
  WHERE wc.category_id = get_random_word_for_category.category_id
  ORDER BY random()
  LIMIT 1;
$$;

COMMENT ON FUNCTION "public"."get_random_word_for_category"(uuid) IS 'Returns one random word (with its primary sign video) in the given category. Only words with an is_primary sign video are eligible. Returns zero rows if none are eligible.';

REVOKE ALL ON FUNCTION "public"."get_random_word_for_category"(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_random_word_for_category"(uuid) FROM "anon";
GRANT ALL ON FUNCTION "public"."get_random_word_for_category"(uuid) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_word_for_category"(uuid) TO "service_role";
