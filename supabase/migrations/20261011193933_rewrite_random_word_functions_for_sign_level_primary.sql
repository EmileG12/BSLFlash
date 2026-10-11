-- Follows the previous migration's move of is_primary from sign_videos to
-- signs: a word's eligible video pool is now "every video of its primary
-- sign", and one is picked at random (not a pinned video) so quizzing never
-- lets a learner recognize a specific take instead of the sign itself.
-- Signatures unchanged, so existing grants carry over -- no REVOKE/GRANT
-- needed here.

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
  SELECT * FROM (
    SELECT DISTINCT ON (w.id)
      w.id AS word_id,
      w.word,
      w.definition,
      sv.storage_path,
      sv.format
    FROM public.words w
    JOIN public.signs s ON s.word_id = w.id AND s.is_primary
    JOIN public.sign_videos sv ON sv.sign_id = s.id
    WHERE w.id IN (
      SELECT word_id FROM public.word_categories
      WHERE category_id = get_random_word_for_category.category_id
        AND NOT get_random_word_for_category.is_custom
      UNION ALL
      SELECT word_id FROM public.custom_deck_words
      WHERE custom_deck_id = get_random_word_for_category.category_id
        AND get_random_word_for_category.is_custom
    )
    AND (
      get_random_word_for_category.subcategory_id IS NULL
      OR w.id IN (
        SELECT word_id FROM public.word_categories
        WHERE category_id = get_random_word_for_category.subcategory_id
      )
    )
    ORDER BY w.id, random()
  ) AS eligible_words
  ORDER BY random()
  LIMIT 1;
$$;

COMMENT ON FUNCTION "public"."get_random_word_for_category"(uuid, boolean, uuid) IS 'Returns one random word (with a random video from its primary sign variant) in the given category or custom deck (is_custom selects which), optionally restricted to subcategory_id via word_categories. Only words whose primary variant has at least one video are eligible. Returns zero rows if none are eligible.';

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
    JOIN public.signs s ON s.word_id = w.id AND s.is_primary
    JOIN public.sign_videos sv ON sv.sign_id = s.id
    WHERE w.id IN (
      SELECT word_id FROM public.word_categories
      WHERE category_id = get_random_words_for_category.category_id
        AND NOT get_random_words_for_category.is_custom
      UNION ALL
      SELECT word_id FROM public.custom_deck_words
      WHERE custom_deck_id = get_random_words_for_category.category_id
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

COMMENT ON FUNCTION "public"."get_random_words_for_category"(uuid, integer, boolean, uuid) IS 'Returns up to card_count distinct random words (each with a random video from its primary sign variant) in the given category or custom deck (is_custom selects which), optionally restricted to subcategory_id, for the 10 Cards game mode. Never repeats a word within one call; returns fewer rows if fewer than card_count are eligible.';
