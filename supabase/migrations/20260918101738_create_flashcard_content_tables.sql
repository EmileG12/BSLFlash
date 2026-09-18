-- Flashcard content schema: categories, words, word_categories (join),
-- signs, and sign_videos. Reference/dictionary data, not user-owned -- every
-- authenticated user can read, only superadmin can write (reuses
-- public.is_superadmin(), same pattern as roles/user_roles).

-- 1. Tables -------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  category_name text not null unique
);

comment on table public.categories is 'Vocabulary categories/topics (e.g. Animals, Greetings, BSL Level 1 Vocabulary).';

create table public.words (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  definition text not null,
  unique (word, definition)
);

comment on table public.words is 'English vocabulary entries. unique(word, definition) blocks exact duplicates while still allowing genuine homonyms (same word, different definition).';

create table public.word_categories (
  word_id uuid not null references public.words (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (word_id, category_id)
);

comment on table public.word_categories is 'Many-to-many join between words and categories -- a word can belong to more than one category.';

create index word_categories_category_id_idx on public.word_categories (category_id);

create table public.signs (
  id uuid primary key default gen_random_uuid(),
  word_id uuid not null references public.words (id) on delete cascade,
  variant_name text not null,
  region text,
  unique (word_id, variant_name, region)
);

comment on table public.signs is 'BSL sign variants for a word (e.g. different regional signs for the same word). region is nullable for variants that are not region-specific.';

create index signs_word_id_idx on public.signs (word_id);

create table public.sign_videos (
  id uuid primary key default gen_random_uuid(),
  sign_id uuid not null references public.signs (id) on delete cascade,
  storage_path text not null,
  format text not null check (format in ('mp4', 'webm')),
  duration_ms integer not null check (duration_ms > 0),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  file_size bigint not null check (file_size > 0),
  is_primary boolean not null default false,
  unique (sign_id, storage_path)
);

comment on table public.sign_videos is 'Video files (in the sign-videos storage bucket) demonstrating a sign. A sign may have several videos; at most one may be is_primary (see sign_videos_one_primary_per_sign).';

create index sign_videos_sign_id_idx on public.sign_videos (sign_id);

create unique index sign_videos_one_primary_per_sign
  on public.sign_videos (sign_id)
  where is_primary;

-- 2. Enable RLS -----------------------------------------------------------

alter table public.categories enable row level security;
alter table public.words enable row level security;
alter table public.word_categories enable row level security;
alter table public.signs enable row level security;
alter table public.sign_videos enable row level security;

-- 3. Policies: categories ----------------------------------------------------

create policy categories_select_authenticated
  on public.categories for select to authenticated
  using (true);

create policy categories_insert_superadmin
  on public.categories for insert to authenticated
  with check (public.is_superadmin());

create policy categories_update_superadmin
  on public.categories for update to authenticated
  using (public.is_superadmin()) with check (public.is_superadmin());

create policy categories_delete_superadmin
  on public.categories for delete to authenticated
  using (public.is_superadmin());

-- 4. Policies: words ----------------------------------------------------

create policy words_select_authenticated
  on public.words for select to authenticated
  using (true);

create policy words_insert_superadmin
  on public.words for insert to authenticated
  with check (public.is_superadmin());

create policy words_update_superadmin
  on public.words for update to authenticated
  using (public.is_superadmin()) with check (public.is_superadmin());

create policy words_delete_superadmin
  on public.words for delete to authenticated
  using (public.is_superadmin());

-- 5. Policies: word_categories ----------------------------------------------

create policy word_categories_select_authenticated
  on public.word_categories for select to authenticated
  using (true);

create policy word_categories_insert_superadmin
  on public.word_categories for insert to authenticated
  with check (public.is_superadmin());

create policy word_categories_update_superadmin
  on public.word_categories for update to authenticated
  using (public.is_superadmin()) with check (public.is_superadmin());

create policy word_categories_delete_superadmin
  on public.word_categories for delete to authenticated
  using (public.is_superadmin());

-- 6. Policies: signs ----------------------------------------------------

create policy signs_select_authenticated
  on public.signs for select to authenticated
  using (true);

create policy signs_insert_superadmin
  on public.signs for insert to authenticated
  with check (public.is_superadmin());

create policy signs_update_superadmin
  on public.signs for update to authenticated
  using (public.is_superadmin()) with check (public.is_superadmin());

create policy signs_delete_superadmin
  on public.signs for delete to authenticated
  using (public.is_superadmin());

-- 7. Policies: sign_videos ----------------------------------------------------

create policy sign_videos_select_authenticated
  on public.sign_videos for select to authenticated
  using (true);

create policy sign_videos_insert_superadmin
  on public.sign_videos for insert to authenticated
  with check (public.is_superadmin());

create policy sign_videos_update_superadmin
  on public.sign_videos for update to authenticated
  using (public.is_superadmin()) with check (public.is_superadmin());

create policy sign_videos_delete_superadmin
  on public.sign_videos for delete to authenticated
  using (public.is_superadmin());
