-- Backs the "Saved decks" section of MyDecksPage. Joins saved_decks (the
-- caller's own rows, via RLS) to custom_decks under invoker rights, so a
-- dormant save (the owner has since unpublished) simply produces no joined
-- row and is naturally excluded here -- no extra is_public check needed,
-- same reasoning as get_public_decks relying on custom_decks' own RLS.
CREATE OR REPLACE FUNCTION "public"."get_saved_decks"()
RETURNS TABLE (
  "id" uuid,
  "deck_name" text,
  "owner_user_id" uuid,
  "owner_name" text
)
LANGUAGE "sql"
STABLE
SET "search_path" TO 'public'
AS $$
  SELECT cd.id, cd.deck_name, cd.user_id AS owner_user_id, p.user_name AS owner_name
  FROM public.saved_decks sd
  JOIN public.custom_decks cd ON cd.id = sd.custom_deck_id
  LEFT JOIN public.profiles p ON p.user_id = cd.user_id
  WHERE sd.user_id = auth.uid()
  ORDER BY cd.deck_name;
$$;

COMMENT ON FUNCTION "public"."get_saved_decks"() IS 'Lists the calling user''s saved decks (public.saved_decks) joined to their current custom_decks row. A deck the owner has since unpublished produces no row here (excluded by custom_decks'' own RLS under invoker rights), reappearing automatically if the owner republishes -- saved_decks itself is never touched by unpublishing.';

REVOKE ALL ON FUNCTION "public"."get_saved_decks"() FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_saved_decks"() FROM "anon";
GRANT ALL ON FUNCTION "public"."get_saved_decks"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_saved_decks"() TO "service_role";
