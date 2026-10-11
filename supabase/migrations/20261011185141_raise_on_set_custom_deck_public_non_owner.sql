-- diff-reviewer finding: set_custom_deck_public silently no-opped for a
-- non-owner (RLS makes the UPDATE affect zero rows, no exception), and the
-- frontend (EditDeckModal.handleTogglePublish) treats error === null as
-- success regardless of whether a row actually changed -- not reachable via
-- the current UI (MyDecksPage only opens the edit modal for owned decks),
-- but worth closing off at the source rather than relying on that staying
-- true. Explicit ownership check, same style as the existing zero-words
-- guard already in this function, so the RPC now returns an error the
-- frontend's existing error handling already knows how to surface instead
-- of silently doing nothing.
CREATE OR REPLACE FUNCTION "public"."set_custom_deck_public"(
  "p_deck_id" uuid,
  "p_is_public" boolean
)
RETURNS void
LANGUAGE plpgsql
SET "search_path" TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.custom_decks WHERE id = p_deck_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Deck not found or not owned by caller';
  END IF;

  IF p_is_public AND NOT EXISTS (
    SELECT 1 FROM public.custom_deck_words WHERE custom_deck_id = p_deck_id
  ) THEN
    RAISE EXCEPTION 'Cannot publish a deck with no words';
  END IF;

  UPDATE public.custom_decks
  SET is_public = p_is_public
  WHERE id = p_deck_id;
END;
$$;

COMMENT ON FUNCTION "public"."set_custom_deck_public"(uuid, boolean) IS 'Toggles a custom deck''s is_public flag. Raises if the caller doesn''t own the deck, or if trying to publish a deck with zero words.';
