-- Rename custom_categories -> custom_decks (and everything named around it)
-- for clarity, ahead of building the public deck directory feature on top.
-- Table/column renames propagate automatically to RLS policy expressions and
-- indexes (Postgres binds those by attribute/table OID, not by name text),
-- but NOT into function bodies, which are stored as plain text -- those are
-- recreated below with updated references.

-- 1. Tables -----------------------------------------------------------------

alter table public.custom_categories rename to custom_decks;
alter table public.custom_category_words rename to custom_deck_words;

-- 2. Columns ------------------------------------------------------------

alter table public.custom_decks rename column category_name to deck_name;
alter table public.custom_deck_words rename column custom_category_id to custom_deck_id;

-- 3. Indexes ----------------------------------------------------------------

alter index public.custom_categories_user_id_idx rename to custom_decks_user_id_idx;
alter index public.custom_category_words_custom_category_id_idx rename to custom_deck_words_custom_deck_id_idx;

-- 4. RLS policies -------------------------------------------------------
-- Renaming only -- the underlying using/with check expressions already
-- follow the table/column renames above automatically.

alter policy custom_categories_select_own on public.custom_decks rename to custom_decks_select_own;
alter policy custom_categories_insert_own on public.custom_decks rename to custom_decks_insert_own;
alter policy custom_categories_update_own on public.custom_decks rename to custom_decks_update_own;
alter policy custom_categories_delete_own on public.custom_decks rename to custom_decks_delete_own;

alter policy custom_category_words_select_own on public.custom_deck_words rename to custom_deck_words_select_own;
alter policy custom_category_words_insert_own on public.custom_deck_words rename to custom_deck_words_insert_own;
alter policy custom_category_words_delete_own on public.custom_deck_words rename to custom_deck_words_delete_own;

-- 5. Table comments ------------------------------------------------------

comment on table public.custom_decks is 'User-created decks assembled from public.words. user_id is the owner -- these never appear in the standard category menus (those only query public.categories).';
comment on table public.custom_deck_words is 'Many-to-many join between custom_decks and words -- same shape as word_categories, but for user-created decks.';

-- 6. Functions ------------------------------------------------------------
-- Function bodies are plain text, so they keep referencing the old
-- table/column names until recreated explicitly.

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
  ORDER BY random()
  LIMIT 1;
$$;

COMMENT ON FUNCTION "public"."get_random_word_for_category"(uuid, boolean, uuid) IS 'Returns one random word (with its primary sign video) in the given category or custom deck (is_custom selects which). Only words with an is_primary sign video are eligible. Returns zero rows if none are eligible.';

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

COMMENT ON FUNCTION "public"."get_random_words_for_category"(uuid, integer, boolean, uuid) IS 'Returns up to card_count distinct random words (with primary sign videos) in the given category or custom deck (is_custom selects which), optionally also restricted to subcategory_id via word_categories, for the 10 Cards game mode. Never repeats a word within one call; returns fewer rows if fewer than card_count are eligible.';

-- create_custom_category -> create_custom_deck: rename plus updated body.
DROP FUNCTION IF EXISTS "public"."create_custom_category"(text, uuid[]);

CREATE OR REPLACE FUNCTION "public"."create_custom_deck"(
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

  INSERT INTO public.custom_decks (deck_name)
  VALUES (p_name)
  RETURNING id INTO v_id;

  INSERT INTO public.custom_deck_words (custom_deck_id, word_id)
  SELECT v_id, word_id FROM unnest(p_word_ids) AS word_id
  ON CONFLICT (custom_deck_id, word_id) DO NOTHING;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION "public"."create_custom_deck"(text, uuid[]) IS 'Creates a custom deck owned by the calling user (custom_decks.user_id defaults to auth.uid()) with the given name and word links, atomically. Raises if p_name is blank or p_word_ids is empty. Duplicate ids in p_word_ids are silently deduped (ON CONFLICT DO NOTHING) rather than failing the whole call.';

REVOKE ALL ON FUNCTION "public"."create_custom_deck"(text, uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."create_custom_deck"(text, uuid[]) FROM "anon";
GRANT ALL ON FUNCTION "public"."create_custom_deck"(text, uuid[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_custom_deck"(text, uuid[]) TO "service_role";
