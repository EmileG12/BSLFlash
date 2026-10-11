-- Backs the "Browse decks" directory page: public decks only, with name
-- search (ILIKE) and tag filtering (a deck must have ALL selected tags --
-- AND semantics, via the "no unmatched tag exists" NOT EXISTS trick),
-- sorted by like count descending by default. p_sort switches to
-- created_at (newest) or deck_name (alphabetical) via CASE branches that
-- are NULL for every row when not selected, so they fall through to the
-- next ORDER BY term without needing dynamic SQL.
CREATE OR REPLACE FUNCTION "public"."get_public_decks"(
  "p_search" text DEFAULT NULL,
  "p_tag_ids" uuid[] DEFAULT NULL,
  "p_sort" text DEFAULT 'likes'
)
RETURNS TABLE (
  "id" uuid,
  "deck_name" text,
  "owner_user_id" uuid,
  "owner_name" text,
  "tag_names" text[],
  "like_count" bigint,
  "liked_by_me" boolean,
  "saved_by_me" boolean,
  "created_at" timestamptz
)
LANGUAGE "sql"
STABLE
SET "search_path" TO 'public'
AS $$
  SELECT
    cd.id,
    cd.deck_name,
    cd.user_id AS owner_user_id,
    p.user_name AS owner_name,
    COALESCE(
      (SELECT array_agg(c.category_name ORDER BY c.category_name)
       FROM public.custom_deck_tags cdt
       JOIN public.categories c ON c.id = cdt.category_id
       WHERE cdt.custom_deck_id = cd.id),
      ARRAY[]::text[]
    ) AS tag_names,
    (SELECT count(*) FROM public.deck_likes dl WHERE dl.custom_deck_id = cd.id) AS like_count,
    EXISTS (
      SELECT 1 FROM public.deck_likes dl
      WHERE dl.custom_deck_id = cd.id AND dl.user_id = auth.uid()
    ) AS liked_by_me,
    EXISTS (
      SELECT 1 FROM public.saved_decks sd
      WHERE sd.custom_deck_id = cd.id AND sd.user_id = auth.uid()
    ) AS saved_by_me,
    cd.created_at
  FROM public.custom_decks cd
  LEFT JOIN public.profiles p ON p.user_id = cd.user_id
  WHERE cd.is_public
    AND (
      get_public_decks.p_search IS NULL OR get_public_decks.p_search = ''
      OR cd.deck_name ILIKE '%' || get_public_decks.p_search || '%'
    )
    AND (
      get_public_decks.p_tag_ids IS NULL OR array_length(get_public_decks.p_tag_ids, 1) IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM unnest(get_public_decks.p_tag_ids) AS tag_id
        WHERE NOT EXISTS (
          SELECT 1 FROM public.custom_deck_tags cdt
          WHERE cdt.custom_deck_id = cd.id AND cdt.category_id = tag_id
        )
      )
    )
  ORDER BY
    (CASE WHEN get_public_decks.p_sort = 'newest' THEN cd.created_at END) DESC NULLS LAST,
    (CASE WHEN get_public_decks.p_sort = 'name' THEN cd.deck_name END) ASC NULLS LAST,
    (SELECT count(*) FROM public.deck_likes dl WHERE dl.custom_deck_id = cd.id) DESC,
    cd.deck_name ASC;
$$;

COMMENT ON FUNCTION "public"."get_public_decks"(text, uuid[], text) IS 'Lists public custom decks for the Browse directory, with optional name search and AND-semantics tag filtering, sorted by like count desc (p_sort=''likes'', the default), newest (''newest''), or name (''name'').';

REVOKE ALL ON FUNCTION "public"."get_public_decks"(text, uuid[], text) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_public_decks"(text, uuid[], text) FROM "anon";
GRANT ALL ON FUNCTION "public"."get_public_decks"(text, uuid[], text) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_decks"(text, uuid[], text) TO "service_role";

-- Tag chips in the directory filter bar: only offer tags that currently
-- match at least one public deck, same "don't offer an empty-result
-- filter" reasoning as get_available_subcategories_for_category. Deck
-- creation/editing uses the full public.categories list instead (any
-- admin-curated tag should be pickable there, even before first use).
CREATE OR REPLACE FUNCTION "public"."get_available_deck_tags"()
RETURNS TABLE (
  "id" uuid,
  "category_name" text
)
LANGUAGE "sql"
STABLE
SET "search_path" TO 'public'
AS $$
  SELECT DISTINCT c.id, c.category_name
  FROM public.categories c
  JOIN public.custom_deck_tags cdt ON cdt.category_id = c.id
  JOIN public.custom_decks cd ON cd.id = cdt.custom_deck_id
  WHERE cd.is_public
  ORDER BY c.category_name;
$$;

COMMENT ON FUNCTION "public"."get_available_deck_tags"() IS 'Returns the categories currently tagging at least one public custom deck, for the Browse directory''s tag filter chips. Excludes tags with zero matching public decks.';

REVOKE ALL ON FUNCTION "public"."get_available_deck_tags"() FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_available_deck_tags"() FROM "anon";
GRANT ALL ON FUNCTION "public"."get_available_deck_tags"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_available_deck_tags"() TO "service_role";
