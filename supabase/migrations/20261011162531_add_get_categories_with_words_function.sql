-- Public deck directory, step 5: now that a categories row can exist purely
-- as a deck tag (via custom_deck_tags) with zero word_categories links, the
-- standard deck-selection menu needs to stop assuming every categories row
-- has words. Replaces the direct `.from('categories')` query the frontend
-- used previously with an RPC that filters to rows with at least one word.
CREATE OR REPLACE FUNCTION "public"."get_categories_with_words"(
  "p_is_vocabulary" boolean
)
RETURNS TABLE (
  "id" uuid,
  "category_name" text,
  "is_vocabulary" boolean
)
LANGUAGE "sql"
STABLE
SET "search_path" TO 'public'
AS $$
  SELECT c.id, c.category_name, c.is_vocabulary
  FROM public.categories c
  WHERE c.is_vocabulary = get_categories_with_words.p_is_vocabulary
    AND EXISTS (SELECT 1 FROM public.word_categories wc WHERE wc.category_id = c.id)
  ORDER BY c.category_name;
$$;

COMMENT ON FUNCTION "public"."get_categories_with_words"(boolean) IS 'Returns categories matching p_is_vocabulary that have at least one word linked via word_categories -- excludes tag-only categories (ones that exist solely to tag custom decks via custom_deck_tags) from the standard deck-selection menus.';

REVOKE ALL ON FUNCTION "public"."get_categories_with_words"(boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_categories_with_words"(boolean) FROM "anon";
GRANT ALL ON FUNCTION "public"."get_categories_with_words"(boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_categories_with_words"(boolean) TO "service_role";
