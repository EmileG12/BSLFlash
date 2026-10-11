-- categories.is_active (added in 20261011193851) was never actually wired
-- into any browsing query -- the superadmin Categories page could toggle it,
-- but a disabled category still showed up everywhere. Filters it out of the
-- two RPCs that drive category browsing (the standard deck-selection menus
-- and the subcategory-narrowing chips). Deliberately NOT filtered: direct
-- single-category lookups (useCategoryInfo) and the full-categories list
-- used for deck/word tagging (useAllCategories, get_public_decks'
-- custom_deck_tags flow) -- disabling only hides a category from browsing,
-- it doesn't revoke an in-progress session or stop it being tagged.

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
    AND c.is_active
    AND EXISTS (SELECT 1 FROM public.word_categories wc WHERE wc.category_id = c.id)
  ORDER BY c.category_name;
$$;

COMMENT ON FUNCTION "public"."get_categories_with_words"(boolean) IS 'Returns active categories matching p_is_vocabulary that have at least one word linked via word_categories -- excludes disabled categories and tag-only categories (ones that exist solely to tag custom decks via custom_deck_tags) from the standard deck-selection menus.';

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
    AND c.is_active
    AND EXISTS (
      SELECT 1 FROM public.word_categories wc1
      JOIN public.word_categories wc2 ON wc1.word_id = wc2.word_id
      WHERE wc1.category_id = get_available_subcategories_for_category.category_id
        AND wc2.category_id = c.id
    )
  ORDER BY c.category_name;
$$;

COMMENT ON FUNCTION "public"."get_available_subcategories_for_category"(uuid) IS 'Returns the active topic categories (is_vocabulary = false) that share at least one word with the given category, for narrowing a vocabulary category''s word pool by subcategory. Excludes disabled categories and topic categories with zero overlapping words.';
