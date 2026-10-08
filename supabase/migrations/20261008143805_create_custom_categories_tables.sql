-- Custom decks: user-created categories built from the existing wordlist.
-- Mirrors categories/word_categories in shape, but each row is owned by the
-- user who created it (not superadmin-curated reference data), so RLS is
-- "only the owner can read/write their own rows" instead of
-- "everyone reads, only superadmin writes".

-- 1. Tables -------------------------------------------------------------

create table public.custom_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_name text not null,
  created_at timestamptz not null default now()
);

comment on table public.custom_categories is 'User-created decks assembled from public.words. user_id is the owner -- these never appear in the standard category menus (those only query public.categories).';

create index custom_categories_user_id_idx on public.custom_categories (user_id);

create table public.custom_category_words (
  custom_category_id uuid not null references public.custom_categories (id) on delete cascade,
  word_id uuid not null references public.words (id) on delete cascade,
  primary key (custom_category_id, word_id)
);

comment on table public.custom_category_words is 'Many-to-many join between custom_categories and words -- same shape as word_categories, but for user-created decks.';

create index custom_category_words_custom_category_id_idx on public.custom_category_words (custom_category_id);

-- 2. Enable RLS -----------------------------------------------------------

alter table public.custom_categories enable row level security;
alter table public.custom_category_words enable row level security;

-- 3. Policies: custom_categories -- owner only -------------------------------

create policy custom_categories_select_own
  on public.custom_categories for select to authenticated
  using (user_id = auth.uid());

create policy custom_categories_insert_own
  on public.custom_categories for insert to authenticated
  with check (user_id = auth.uid());

create policy custom_categories_update_own
  on public.custom_categories for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy custom_categories_delete_own
  on public.custom_categories for delete to authenticated
  using (user_id = auth.uid());

-- 4. Policies: custom_category_words -- gated via the parent deck's owner ----
-- No update policy: a row either links a word to a deck or it doesn't, there's
-- nothing on the row itself to update.

create policy custom_category_words_select_own
  on public.custom_category_words for select to authenticated
  using (
    exists (
      select 1 from public.custom_categories cc
      where cc.id = custom_category_words.custom_category_id
        and cc.user_id = auth.uid()
    )
  );

create policy custom_category_words_insert_own
  on public.custom_category_words for insert to authenticated
  with check (
    exists (
      select 1 from public.custom_categories cc
      where cc.id = custom_category_words.custom_category_id
        and cc.user_id = auth.uid()
    )
  );

create policy custom_category_words_delete_own
  on public.custom_category_words for delete to authenticated
  using (
    exists (
      select 1 from public.custom_categories cc
      where cc.id = custom_category_words.custom_category_id
        and cc.user_id = auth.uid()
    )
  );
