-- Add subcategory filtering so a vocabulary category (e.g. GCSE) can be
-- narrowed to just the words it shares with one topic category (e.g.
-- Colours), via their common link through word_categories. subcategory_id
-- defaults to NULL so every existing call site keeps matching the whole
-- category unchanged.

-- CREATE OR REPLACE can't change a function's parameter list -- drop the old
-- overloads first, same as the prior migration that added is_custom.
DROP FUNCTION IF EXISTS "public"."get_random_word_for_category"(uuid, boolean);
DROP FUNCTION IF EXISTS "public"."get_random_words_for_category"(uuid, integer, boolean);

CREATE OR REPLACE FUNCTION "public"."get_random_word_for_category"(
  "category_id" uuid,
  "is_custom" boolean DEFAULT false,
  "subcategory_id" uuid DEFAULT NULL
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
  AND (
    get_random_word_for_category.subcategory_id IS NULL
    OR w.id IN (
      SELECT word_id FROM public.word_categories
      WHERE category_id = get_random_word_for_category.subcategory_id
    )
  )
  ORDER BY random()
  LIMIT 1;
$$;

COMMENT ON FUNCTION "public"."get_random_word_for_category"(uuid, boolean, uuid) IS 'Returns one random word (with its primary sign video) in the given category or custom deck (is_custom selects which), optionally also restricted to subcategory_id via word_categories. Only words with an is_primary sign video are eligible. Returns zero rows if none are eligible.';

REVOKE ALL ON FUNCTION "public"."get_random_word_for_category"(uuid, boolean, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_random_word_for_category"(uuid, boolean, uuid) FROM "anon";
GRANT ALL ON FUNCTION "public"."get_random_word_for_category"(uuid, boolean, uuid) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_word_for_category"(uuid, boolean, uuid) TO "service_role";

CREATE OR REPLACE FUNCTION "public"."get_random_words_for_category"(
    "category_id" uuid,
    "card_count" integer DEFAULT 10,
    "is_custom" boolean DEFAULT false,
    "subcategory_id" uuid DEFAULT NULL
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
    AND (
      get_random_words_for_category.subcategory_id IS NULL
      OR w.id IN (
        SELECT word_id FROM public.word_categories
        WHERE category_id = get_random_words_for_category.subcategory_id
      )
    )
    ORDER BY w.id, random()
) AS eligible_words
ORDER BY random()
LIMIT get_random_words_for_category.card_count;
$$;

COMMENT ON FUNCTION "public"."get_random_words_for_category"(uuid, integer, boolean, uuid) IS 'Returns up to card_count distinct random words (with primary sign videos) in the given category or custom deck (is_custom selects which), optionally also restricted to subcategory_id via word_categories, for the 10 Cards game mode. Never repeats a word within one call; returns fewer rows if fewer than card_count are eligible.';

REVOKE ALL ON FUNCTION "public"."get_random_words_for_category"(uuid, integer, boolean, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_random_words_for_category"(uuid, integer, boolean, uuid) FROM "anon";
GRANT ALL ON FUNCTION "public"."get_random_words_for_category"(uuid, integer, boolean, uuid) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_words_for_category"(uuid, integer, boolean, uuid) TO "service_role";

-- New RPC: which topic categories (is_vocabulary = false) share at least one
-- word with the given category, via a self-join on word_categories. Used to
-- hide subcategory choices that would otherwise produce zero words.
CREATE OR REPLACE FUNCTION "public"."get_available_subcategories_for_category"(
  "category_id" uuid
)
RETURNS TABLE (
  "id" uuid,
  "category_name" text
)
LANGUAGE "sql"
STABLE
SET "search_path" TO 'public'
AS $$
  SELECT c.id, c.category_name
  FROM public.categories c
  WHERE c.is_vocabulary = false
    AND EXISTS (
      SELECT 1 FROM public.word_categories wc1
      JOIN public.word_categories wc2 ON wc1.word_id = wc2.word_id
      WHERE wc1.category_id = get_available_subcategories_for_category.category_id
        AND wc2.category_id = c.id
    )
  ORDER BY c.category_name;
$$;

COMMENT ON FUNCTION "public"."get_available_subcategories_for_category"(uuid) IS 'Returns the topic categories (is_vocabulary = false) that share at least one word with the given category, for narrowing a vocabulary category''s word pool by subcategory. Excludes topic categories with zero overlapping words.';

REVOKE ALL ON FUNCTION "public"."get_available_subcategories_for_category"(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_available_subcategories_for_category"(uuid) FROM "anon";
GRANT ALL ON FUNCTION "public"."get_available_subcategories_for_category"(uuid) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_available_subcategories_for_category"(uuid) TO "service_role";
