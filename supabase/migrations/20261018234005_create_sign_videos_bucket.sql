-- The sign-videos bucket was only ever declared in supabase/config.toml's
-- [storage.buckets.sign-videos], which is applied by `npx supabase
-- start`/`stop` against the local Docker stack -- never by `supabase db
-- push`, the only command the deploy pipeline runs against the hosted
-- staging/production projects (see docs/deployment/hosting.md). So the
-- bucket was never created on either hosted project, and any video upload
-- against them fails with "Bucket not found" even though the RLS policies
-- in 20260918115717_create_sign_videos_storage_policies.sql (scoped to
-- bucket_id = 'sign-videos') have existed the whole time.
--
-- Creating the bucket here, as an ordinary migration, makes it provisioned
-- the same way as everything else -- via `supabase db push`/`db reset` --
-- on local, staging, and production alike. The config.toml declaration is
-- removed in the same change so there is exactly one source of truth.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sign-videos', 'sign-videos', true, 52428800, array['video/mp4', 'video/webm'])
on conflict (id) do nothing;
