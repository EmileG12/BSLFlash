-- Extend get_random_word_for_category / get_random_words_for_category to also
-- serve custom decks, instead of duplicating a second pair of RPCs. Both are
-- plain LANGUAGE sql functions with no SECURITY DEFINER, so they already run
-- with the caller's RLS applied -- a user passing someone else's custom deck
-- id as category_id just gets zero rows back via custom_category_words' RLS,
-- no extra ownership check needed here.
--
-- is_custom defaults to false so every existing call site (which doesn't
-- pass it) keeps matching against word_categories unchanged. The UNION ALL
-- with a boolean guard on each branch is a plain-SQL stand-in for an
-- if/else: exactly one branch's WHERE is satisfiable per call, since
-- is_custom and NOT is_custom can't both hold.

-- CREATE OR REPLACE can't change a function's parameter list -- Postgres
-- would keep the old 1-arg overload alongside this one, and a call passing
-- only category_id would then be ambiguous (matches the old exactly, and
-- this one via is_custom's default). Drop the old overloads first.
DROP FUNCTION IF EXISTS "public"."get_random_word_for_category"(uuid);
DROP FUNCTION IF EXISTS "public"."get_random_words_for_category"(uuid, integer);

CREATE OR REPLACE FUNCTION "public"."get_random_word_for_category"(
  "category_id" uuid,
  "is_custom" boolean DEFAULT false
)
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
  FROM public.words w
  JOIN public.signs s ON s.word_id = w.id
  JOIN public.sign_videos sv ON sv.sign_id = s.id AND sv.is_primary
  WHERE w.id IN (
    SELECT word_id FROM public.word_categories
    WHERE category_id = get_random_word_for_category.category_id
      AND NOT get_random_word_for_category.is_custom
    UNION ALL
    SELECT word_id FROM public.custom_category_words
    WHERE custom_category_id = get_random_word_for_category.category_id
      AND get_random_word_for_category.is_custom
  )
  ORDER BY random()
  LIMIT 1;
$$;

COMMENT ON FUNCTION "public"."get_random_word_for_category"(uuid, boolean) IS 'Returns one random word (with its primary sign video) in the given category or custom deck (is_custom selects which). Only words with an is_primary sign video are eligible. Returns zero rows if none are eligible.';

REVOKE ALL ON FUNCTION "public"."get_random_word_for_category"(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_random_word_for_category"(uuid, boolean) FROM "anon";
GRANT ALL ON FUNCTION "public"."get_random_word_for_category"(uuid, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_word_for_category"(uuid, boolean) TO "service_role";

CREATE OR REPLACE FUNCTION "public"."get_random_words_for_category"(
    "category_id" uuid,
    "card_count" integer DEFAULT 10,
    "is_custom" boolean DEFAULT false
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
    FROM public.words w
    JOIN public.signs s ON s.word_id = w.id
    JOIN public.sign_videos sv ON sv.sign_id = s.id AND sv.is_primary
    WHERE w.id IN (
      SELECT word_id FROM public.word_categories
      WHERE category_id = get_random_words_for_category.category_id
        AND NOT get_random_words_for_category.is_custom
      UNION ALL
      SELECT word_id FROM public.custom_category_words
      WHERE custom_category_id = get_random_words_for_category.category_id
        AND get_random_words_for_category.is_custom
    )
    ORDER BY w.id, random()
) AS eligible_words
ORDER BY random()
LIMIT get_random_words_for_category.card_count;
$$;

COMMENT ON FUNCTION "public"."get_random_words_for_category"(uuid, integer, boolean) IS 'Returns up to card_count distinct random words (with primary sign videos) in the given category or custom deck (is_custom selects which), for the 10 Cards game mode. Never repeats a word within one call; returns fewer rows if fewer than card_count are eligible.';

REVOKE ALL ON FUNCTION "public"."get_random_words_for_category"(uuid, integer, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_random_words_for_category"(uuid, integer, boolean) FROM "anon";
GRANT ALL ON FUNCTION "public"."get_random_words_for_category"(uuid, integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_words_for_category"(uuid, integer, boolean) TO "service_role";
