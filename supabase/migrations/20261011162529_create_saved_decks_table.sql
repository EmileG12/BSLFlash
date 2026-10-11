-- Public deck directory, step 3: "add to profile" is a live reference, not
-- a copy -- this join table just records that a user wants a given deck in
-- their library. It is never cleaned up when the owner unpublishes; the
-- select policy on custom_decks (is_public OR own) is what makes a saved
-- deck disappear from view while unpublished and silently reappear if the
-- owner republishes it, with no action needed from the user who saved it.

create table public.saved_decks (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  custom_deck_id uuid not null references public.custom_decks (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, custom_deck_id)
);

comment on table public.saved_decks is 'Decks a user has added to their library from the public directory. A live reference (by id) to the original custom_decks row, not a copy -- disappears from view if the owner unpublishes, reappears if they republish.';

create index saved_decks_custom_deck_id_idx on public.saved_decks (custom_deck_id);

alter table public.saved_decks enable row level security;

-- Private to the saving user -- no one else needs to read whose library a
-- deck is in (unlike deck_likes, which is a public quality signal).
create policy saved_decks_select_own
  on public.saved_decks for select to authenticated
  using (user_id = auth.uid());

create policy saved_decks_insert_own
  on public.saved_decks for insert to authenticated
  with check (user_id = auth.uid());

create policy saved_decks_delete_own
  on public.saved_decks for delete to authenticated
  using (user_id = auth.uid());
