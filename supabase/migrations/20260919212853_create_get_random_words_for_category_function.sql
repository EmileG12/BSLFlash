-- Returns up to card_count DISTINCT random words (+ each one's primary sign
-- video) belonging to the given category, for the "10 Cards" game mode.
-- Unlike get_random_word_for_category, a word is never returned twice in
-- the same call. If the category has fewer than card_count eligible words,
-- returns however many exist rather than erroring.
CREATE OR REPLACE FUNCTION "public"."get_random_words_for_category"(
    "category_id" uuid,
    "card_count" integer DEFAULT 10
)
RETURNS TABLE(
    "word_id" uuid,
    "word" text,
    "definition" text,
    "storage_path" text,
    "format" text
)
LANGUAGE "sql"
SET "search_path" TO 'public'
AS $$
SELECT * FROM (
    SELECT DISTINCT ON (w.id)
        w.id AS "word_id", w.word, w.definition, sv.storage_path, sv.format
    FROM public.word_categories wc
    JOIN public.words w ON w.id = wc.word_id
    JOIN public.signs s ON s.word_id = w.id
    JOIN public.sign_videos sv ON sv.sign_id = s.id AND sv.is_primary
    WHERE wc.category_id = get_random_words_for_category.category_id
    ORDER BY w.id, random()
) AS eligible_words
ORDER BY random()
LIMIT get_random_words_for_category.card_count;
$$;

COMMENT ON FUNCTION "public"."get_random_words_for_category"(uuid, integer) IS 'Returns up to card_count distinct random words (with primary sign videos) in the given category, for the 10 Cards game mode. Never repeats a word within one call; returns fewer rows if the category has fewer than card_count eligible words.';

REVOKE ALL ON FUNCTION "public"."get_random_words_for_category"(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_random_words_for_category"(uuid, integer) FROM "anon";
GRANT ALL ON FUNCTION "public"."get_random_words_for_category"(uuid, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_words_for_category"(uuid, integer) TO "service_role";
