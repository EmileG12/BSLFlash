-- Fixes the "Add a new word"/"Add variant"/"Add video" admin flows, which
-- used to run as several separate client-side requests: insert word, insert
-- sign, upload video to Storage, insert sign_videos, (optionally) insert
-- word_categories. Storage isn't part of a Postgres transaction, so if the
-- upload failed partway through, the word/sign rows already inserted stayed
-- committed with no video -- and the client had no reliable way to tell the
-- admin which step actually failed.
--
-- The fix always uploads the video to Storage FIRST (from the client, via
-- uploadSignVideoFile), then calls one of the functions below to do every
-- database write in a single transaction. Postgres functions already run
-- inside the transaction of their calling statement, so any exception
-- inside the function -- a constraint violation, an RLS denial -- rolls
-- back every insert the function made; there's no partial commit to clean
-- up on the DB side. If the function itself raises, the client is
-- responsible for deleting the now-orphaned Storage object it already
-- uploaded (via deleteSignVideoFile) and reporting whether that cleanup
-- succeeded, since that's the one piece a database transaction can't cover.
--
-- The sign id is generated client-side (not left to signs.id's
-- gen_random_uuid() default) so the video's storage path -- which is
-- conventionally <sign_id>/<file>.<ext> -- can be built and uploaded before
-- the sign row exists, then passed in so the row is inserted with that
-- exact id.
--
-- No SECURITY DEFINER and no manual role checks: these functions run with
-- the caller's own rights (the default), so the existing RLS insert
-- policies on words/signs/sign_videos/word_categories (admin-or-superadmin,
-- per 20261011193831_allow_admin_insert_on_word_content_tables.sql) apply to
-- every insert exactly as if the client had issued it directly, and a
-- non-admin caller gets Postgres's ordinary RLS-denial error.

create or replace function public.add_word_with_video(
  p_word text,
  p_definition text,
  p_sign_id uuid,
  p_storage_path text,
  p_format text,
  p_duration_ms integer,
  p_width integer,
  p_height integer,
  p_file_size bigint,
  p_category_ids uuid[] default '{}'
)
returns table (word_id uuid, sign_id uuid, sign_video_id uuid)
language plpgsql
set search_path = public
as $$
declare
  v_word_id uuid;
  v_sign_video_id uuid;
begin
  insert into public.words (word, definition)
  values (p_word, p_definition)
  returning id into v_word_id;

  insert into public.signs (id, word_id, variant_name, is_primary)
  values (p_sign_id, v_word_id, 'Standard', true);

  insert into public.sign_videos (sign_id, storage_path, format, duration_ms, width, height, file_size)
  values (p_sign_id, p_storage_path, p_format, p_duration_ms, p_width, p_height, p_file_size)
  returning id into v_sign_video_id;

  if array_length(p_category_ids, 1) is not null then
    insert into public.word_categories (word_id, category_id)
    select v_word_id, category_id from unnest(p_category_ids) as category_id;
  end if;

  return query select v_word_id, p_sign_id, v_sign_video_id;
end;
$$;

comment on function public.add_word_with_video(text, text, uuid, text, text, integer, integer, integer, bigint, uuid[]) is
  'Admin/superadmin-only (enforced by RLS on each insert): creates a word with its first ("Standard", primary) sign variant, the sign_videos row for an already-uploaded video, and optional category tags, all in one transaction. The caller must upload the video to the sign-videos bucket (under p_sign_id) before calling this, and must delete that object if this call fails.';

revoke all on function public.add_word_with_video(text, text, uuid, text, text, integer, integer, integer, bigint, uuid[]) from public;
revoke all on function public.add_word_with_video(text, text, uuid, text, text, integer, integer, integer, bigint, uuid[]) from anon;
grant execute on function public.add_word_with_video(text, text, uuid, text, text, integer, integer, integer, bigint, uuid[]) to authenticated;

create or replace function public.add_variant_with_video(
  p_word_id uuid,
  p_sign_id uuid,
  p_variant_name text,
  p_region text,
  p_storage_path text,
  p_format text,
  p_duration_ms integer,
  p_width integer,
  p_height integer,
  p_file_size bigint
)
returns table (
  id uuid,
  variant_name text,
  region text,
  is_primary boolean,
  video_id uuid,
  video_storage_path text,
  video_format text,
  video_duration_ms integer,
  video_width integer,
  video_height integer,
  video_file_size bigint
)
language plpgsql
set search_path = public
as $$
declare
  v_video_id uuid;
  v_region text;
begin
  -- p_region is declared text (not text|null) so the generated TS RPC Args
  -- type stays a plain string -- the client always sends '' for "no
  -- region", which is normalized to NULL here to match signs.region's
  -- actual nullable column.
  v_region := nullif(p_region, '');

  insert into public.signs (id, word_id, variant_name, region)
  values (p_sign_id, p_word_id, p_variant_name, v_region);

  insert into public.sign_videos (sign_id, storage_path, format, duration_ms, width, height, file_size)
  values (p_sign_id, p_storage_path, p_format, p_duration_ms, p_width, p_height, p_file_size)
  returning id into v_video_id;

  return query
    select p_sign_id, p_variant_name, v_region, false, v_video_id, p_storage_path, p_format, p_duration_ms, p_width, p_height, p_file_size;
end;
$$;

comment on function public.add_variant_with_video(uuid, uuid, text, text, text, text, integer, integer, integer, bigint) is
  'Admin/superadmin-only (enforced by RLS on each insert): adds a new sign variant to an existing word plus the sign_videos row for its already-uploaded first video, in one transaction. The caller must upload the video to the sign-videos bucket (under p_sign_id) before calling this, and must delete that object if this call fails.';

revoke all on function public.add_variant_with_video(uuid, uuid, text, text, text, text, integer, integer, integer, bigint) from public;
revoke all on function public.add_variant_with_video(uuid, uuid, text, text, text, text, integer, integer, integer, bigint) from anon;
grant execute on function public.add_variant_with_video(uuid, uuid, text, text, text, text, integer, integer, integer, bigint) to authenticated;

create or replace function public.add_video_to_sign(
  p_sign_id uuid,
  p_storage_path text,
  p_format text,
  p_duration_ms integer,
  p_width integer,
  p_height integer,
  p_file_size bigint
)
returns table (
  id uuid,
  storage_path text,
  format text,
  duration_ms integer,
  width integer,
  height integer,
  file_size bigint
)
language plpgsql
set search_path = public
as $$
declare
  v_video_id uuid;
begin
  insert into public.sign_videos (sign_id, storage_path, format, duration_ms, width, height, file_size)
  values (p_sign_id, p_storage_path, p_format, p_duration_ms, p_width, p_height, p_file_size)
  returning id into v_video_id;

  return query select v_video_id, p_storage_path, p_format, p_duration_ms, p_width, p_height, p_file_size;
end;
$$;

comment on function public.add_video_to_sign(uuid, text, text, integer, integer, integer, bigint) is
  'Admin/superadmin-only (enforced by RLS): adds another video to an existing sign variant for its already-uploaded file, as a single-statement transaction. Kept as its own function (rather than a plain insert) so the client''s upload-then-write-then-cleanup-on-failure handling is uniform across all three add-video paths. The caller must upload the video to the sign-videos bucket (under p_sign_id) before calling this, and must delete that object if this call fails.';

revoke all on function public.add_video_to_sign(uuid, text, text, integer, integer, integer, bigint) from public;
revoke all on function public.add_video_to_sign(uuid, text, text, integer, integer, integer, bigint) from anon;
grant execute on function public.add_video_to_sign(uuid, text, text, integer, integer, integer, bigint) to authenticated;
