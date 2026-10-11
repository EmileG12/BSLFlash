-- diff-reviewer finding: saved_decks_insert_own / deck_likes_insert_own only
-- checked user_id = auth.uid(), not that custom_deck_id refers to a deck the
-- caller can actually see. The FK only requires the id to exist in
-- custom_decks, not that it's visible, so a user who somehow learned another
-- user's PRIVATE deck id could insert a phantom like/save row for it -- no
-- content leaks (the deck's own select RLS still gates that), but it's a
-- real gap against the "only visible decks" intent stated in those tables'
-- own migration comments. Add the same own-or-public EXISTS check already
-- used by every select policy on these tables.

alter policy saved_decks_insert_own on public.saved_decks
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.custom_decks cd
      where cd.id = saved_decks.custom_deck_id
        and (cd.user_id = auth.uid() or cd.is_public)
    )
  );

alter policy deck_likes_insert_own on public.deck_likes
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.custom_decks cd
      where cd.id = deck_likes.custom_deck_id
        and (cd.user_id = auth.uid() or cd.is_public)
    )
  );
