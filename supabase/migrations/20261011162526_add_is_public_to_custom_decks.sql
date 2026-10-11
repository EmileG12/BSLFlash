-- Public deck directory, step 1: let a deck owner publish their deck so
-- other users can discover and play it. Visibility is a plain boolean the
-- owner can flip freely (no moderation gate for v1) -- unpublishing never
-- deletes anything downstream (saves/likes), it just stops matching the new
-- "is_public = true" read policies below, so a republish silently restores
-- visibility for everyone who'd already saved it.

alter table public.custom_decks add column is_public boolean not null default false;

-- Public read access, additive to the existing owner-only policies -- a
-- user now sees their own decks (any visibility) OR anyone's public decks.

create policy custom_decks_select_public
  on public.custom_decks for select to authenticated
  using (is_public);

create policy custom_deck_words_select_public
  on public.custom_deck_words for select to authenticated
  using (
    exists (
      select 1 from public.custom_decks cd
      where cd.id = custom_deck_words.custom_deck_id
        and cd.is_public
    )
  );

-- Toggling publish is just an owner-gated update, already covered by
-- custom_decks_update_own -- this RPC adds the one guard that matters
-- beyond ownership: a deck with no words can't be published, since it would
-- show up in the directory as something nobody can actually play.
CREATE OR REPLACE FUNCTION "public"."set_custom_deck_public"(
  "p_deck_id" uuid,
  "p_is_public" boolean
)
RETURNS void
LANGUAGE plpgsql
SET "search_path" TO 'public'
AS $$
BEGIN
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

COMMENT ON FUNCTION "public"."set_custom_deck_public"(uuid, boolean) IS 'Toggles a custom deck''s is_public flag. Runs as the caller (no SECURITY DEFINER), so custom_decks_update_own RLS still enforces that only the owner can call this successfully. Raises if trying to publish a deck with zero words.';

REVOKE ALL ON FUNCTION "public"."set_custom_deck_public"(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."set_custom_deck_public"(uuid, boolean) FROM "anon";
GRANT ALL ON FUNCTION "public"."set_custom_deck_public"(uuid, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_custom_deck_public"(uuid, boolean) TO "service_role";
