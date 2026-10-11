-- Public deck directory, step 4: likes are a separate, lightweight quality
-- signal distinct from saving (public.saved_decks) -- a deck can be liked
-- without being saved, and saved without being liked. Unlike saved_decks,
-- the existence of likes (and who liked what) is public, since the
-- directory sorts by like count and needs to show it.

create table public.deck_likes (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  custom_deck_id uuid not null references public.custom_decks (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, custom_deck_id)
);

comment on table public.deck_likes is 'One row per user-like on a public custom deck. A separate signal from saved_decks -- liking does not add the deck to your library, and saving does not like it.';

create index deck_likes_custom_deck_id_idx on public.deck_likes (custom_deck_id);

alter table public.deck_likes enable row level security;

-- Readable by anyone (authenticated) alongside whatever custom_decks rows
-- they can already see -- the directory needs to count/display likes on
-- any public deck, not just the caller's own likes.
create policy deck_likes_select_visible
  on public.deck_likes for select to authenticated
  using (
    exists (
      select 1 from public.custom_decks cd
      where cd.id = deck_likes.custom_deck_id
        and (cd.user_id = auth.uid() or cd.is_public)
    )
  );

create policy deck_likes_insert_own
  on public.deck_likes for insert to authenticated
  with check (user_id = auth.uid());

create policy deck_likes_delete_own
  on public.deck_likes for delete to authenticated
  using (user_id = auth.uid());
