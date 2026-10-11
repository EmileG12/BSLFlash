-- Admins can add new words (with their first sign variant + video) and tag
-- existing words into existing categories, but never create categories, edit
-- word text, add further sign variants, or delete anything -- all of that
-- stays superadmin-only via the existing policies. word_categories also gets
-- an admin delete policy (not just insert) so admins can correct a wrong
-- category tag on a word they're editing, not just add new ones.

alter policy words_insert_superadmin on public.words
  rename to words_insert_admin_or_superadmin;
alter policy words_insert_admin_or_superadmin on public.words
  with check (public.is_superadmin() or public.is_admin());

alter policy word_categories_insert_superadmin on public.word_categories
  rename to word_categories_insert_admin_or_superadmin;
alter policy word_categories_insert_admin_or_superadmin on public.word_categories
  with check (public.is_superadmin() or public.is_admin());

alter policy word_categories_delete_superadmin on public.word_categories
  rename to word_categories_delete_admin_or_superadmin;
alter policy word_categories_delete_admin_or_superadmin on public.word_categories
  using (public.is_superadmin() or public.is_admin());

alter policy signs_insert_superadmin on public.signs
  rename to signs_insert_admin_or_superadmin;
alter policy signs_insert_admin_or_superadmin on public.signs
  with check (public.is_superadmin() or public.is_admin());

alter policy sign_videos_insert_superadmin on public.sign_videos
  rename to sign_videos_insert_admin_or_superadmin;
alter policy sign_videos_insert_admin_or_superadmin on public.sign_videos
  with check (public.is_superadmin() or public.is_admin());

-- storage.objects isn't owned by the migration role, so ALTER POLICY
-- RENAME (used above for public.* tables) isn't permitted here -- drop and
-- recreate instead.
drop policy sign_videos_bucket_insert_superadmin on storage.objects;
create policy sign_videos_bucket_insert_admin_or_superadmin
  on storage.objects for insert to authenticated
  with check (bucket_id = 'sign-videos' and (public.is_superadmin() or public.is_admin()));
