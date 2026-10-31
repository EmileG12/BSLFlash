-- add_variant_with_video and add_video_to_sign both failed at runtime with
-- "column reference \"id\" is ambiguous": each declares RETURNS TABLE(id
-- uuid, ...), which implicitly creates a plpgsql variable named `id` in the
-- function's scope, and that variable shadowed the bare `id` column
-- reference in `insert into public.sign_videos (...) returning id into
-- v_video_id`. add_word_with_video was unaffected only because its return
-- columns are named word_id/sign_id/sign_video_id, not id.
--
-- Fixed by aliasing the insert target and qualifying the RETURNING column
-- with that alias, so it's unambiguous which `id` is meant.

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
  v_region := nullif(p_region, '');

  insert into public.signs (id, word_id, variant_name, region)
  values (p_sign_id, p_word_id, p_variant_name, v_region);

  insert into public.sign_videos as sv (sign_id, storage_path, format, duration_ms, width, height, file_size)
  values (p_sign_id, p_storage_path, p_format, p_duration_ms, p_width, p_height, p_file_size)
  returning sv.id into v_video_id;

  return query
    select p_sign_id, p_variant_name, v_region, false, v_video_id, p_storage_path, p_format, p_duration_ms, p_width, p_height, p_file_size;
end;
$$;

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
  insert into public.sign_videos as sv (sign_id, storage_path, format, duration_ms, width, height, file_size)
  values (p_sign_id, p_storage_path, p_format, p_duration_ms, p_width, p_height, p_file_size)
  returning sv.id into v_video_id;

  return query select v_video_id, p_storage_path, p_format, p_duration_ms, p_width, p_height, p_file_size;
end;
$$;
