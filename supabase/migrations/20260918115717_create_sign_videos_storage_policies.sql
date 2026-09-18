-- RLS policies for storage.objects scoped to the sign-videos bucket
-- (declared public in supabase/config.toml [storage.buckets.sign-videos]).
--
-- Public buckets serve reads via the /object/public/ endpoint without going
-- through RLS at all, so making the bucket public does not by itself grant
-- write access -- writes to storage.objects always go through these
-- policies regardless of bucket visibility. Policies are written `to
-- authenticated` (never `to public`/`anon`), so an unauthenticated request
-- matches no policy and is rejected by RLS's default-deny; is_superadmin()
-- then also rejects any authenticated-but-non-superadmin user.

create policy sign_videos_bucket_select_authenticated
  on storage.objects for select to authenticated
  using (bucket_id = 'sign-videos');

create policy sign_videos_bucket_insert_superadmin
  on storage.objects for insert to authenticated
  with check (bucket_id = 'sign-videos' and public.is_superadmin());

create policy sign_videos_bucket_update_superadmin
  on storage.objects for update to authenticated
  using (bucket_id = 'sign-videos' and public.is_superadmin())
  with check (bucket_id = 'sign-videos' and public.is_superadmin());

create policy sign_videos_bucket_delete_superadmin
  on storage.objects for delete to authenticated
  using (bucket_id = 'sign-videos' and public.is_superadmin());
