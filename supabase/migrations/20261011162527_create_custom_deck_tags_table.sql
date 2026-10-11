-- Public deck directory, step 2: tags for filtering the directory. Tags
-- reuse the existing public.categories table rather than a new dedicated
-- tags table -- a category row can now serve double duty (tagging words via
-- word_categories, and/or tagging decks via this join table), and a future
-- tag that should never apply to a word (e.g. an org-partnership tag) can
-- simply be a categories row with no word_categories rows at all. The
-- get_categories_with_words() RPC (added separately) is what keeps such
-- tag-only rows out of the standard word-deck menus.

create table public.custom_deck_tags (
  custom_deck_id uuid not null references public.custom_decks (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (custom_deck_id, category_id)
);

comment on table public.custom_deck_tags is 'Many-to-many join tagging a custom deck with rows from public.categories, for filtering the public deck directory. Reuses categories instead of a separate tags table.';

create index custom_deck_tags_category_id_idx on public.custom_deck_tags (category_id);

alter table public.custom_deck_tags enable row level security;

-- Readable alongside whatever custom_decks rows are already visible to the
-- caller (their own, or anyone's public deck) -- mirrors custom_deck_words'
-- select policy shape.
create policy custom_deck_tags_select_visible
  on public.custom_deck_tags for select to authenticated
  using (
    exists (
      select 1 from public.custom_decks cd
      where cd.id = custom_deck_tags.custom_deck_id
        and (cd.user_id = auth.uid() or cd.is_public)
    )
  );

-- Only the deck owner can tag/untag their own deck. No update policy, same
-- reasoning as custom_deck_words: a tag link either exists or doesn't.
create policy custom_deck_tags_insert_own
  on public.custom_deck_tags for insert to authenticated
  with check (
    exists (
      select 1 from public.custom_decks cd
      where cd.id = custom_deck_tags.custom_deck_id
        and cd.user_id = auth.uid()
    )
  );

create policy custom_deck_tags_delete_own
  on public.custom_deck_tags for delete to authenticated
  using (
    exists (
      select 1 from public.custom_decks cd
      where cd.id = custom_deck_tags.custom_deck_id
        and cd.user_id = auth.uid()
    )
  );
