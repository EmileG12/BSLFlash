# add_variant_with_video

**Signature:** `public.add_variant_with_video(p_word_id uuid, p_sign_id uuid, p_variant_name text, p_region text, p_storage_path text, p_format text, p_duration_ms integer, p_width integer, p_height integer, p_file_size bigint) RETURNS TABLE(id uuid, variant_name text, region text, is_primary boolean, video_id uuid, video_storage_path text, video_format text, video_duration_ms integer, video_width integer, video_height integer, video_file_size bigint)`
**Language:** PL/pgSQL, `SET search_path = public` (not `SECURITY DEFINER`)
**Created by migration:** [`20261018234007_create_atomic_add_word_video_functions.sql`](../../supabase/migrations/20261018234007_create_atomic_add_word_video_functions.sql), fixed by [`20261028183304_fix_ambiguous_id_in_video_rpcs.sql`](../../supabase/migrations/20261028183304_fix_ambiguous_id_in_video_rpcs.sql)

**Purpose:** Adds a new, non-primary sign variant to an existing word, together with the `sign_videos` row for its first video, in one transaction. Called from the "Add a new variant" dialog on [SuperadminWordEditPage](../components/SuperadminWordEditPage.md).

**Why it exists at all:** same as [add_word_with_video](./add_word_with_video.md). The video is uploaded to [Storage](../storage/sign-videos.md) first, and Storage is not part of the Postgres transaction. One call covers both the `signs` and `sign_videos` inserts, so a failure never leaves a bare variant with no video.

**Why the sign id is a parameter:** the storage path convention is `<sign_id>/<file>.<ext>`. The client generates the id, uploads under it, and passes it here so the `signs` row is inserted with that id.

**Why `p_region` is plain `text`:** the generated TypeScript RPC argument type has no clean way to express a nullable argument. The client always sends `''` for "no region", and the function normalises it with `nullif(p_region, '')` before insert, so `signs.region` stores `NULL`.

**Return value:** the new sign's own columns (`id`, `variant_name`, `region`, `is_primary`, always `false` here) plus the new video's columns prefixed `video_`. The client uses this to append the variant to its list without a refetch.

**Why not `SECURITY DEFINER`:** the function runs as the caller. The `signs_insert_admin_or_superadmin` and `sign_videos_insert_admin_or_superadmin` policies apply to each insert as if the client had issued it directly, so a caller who is neither admin nor superadmin gets the RLS-denial error.

**Client-side compensation:** if this call fails, the caller deletes the already-uploaded object via [deleteSignVideoFile](../utils/signVideoUpload.md).

**Why the insert is aliased (`insert into public.sign_videos as sv ... returning sv.id`):** `RETURNS TABLE(id uuid, ...)` implicitly declares a plpgsql variable named `id` in the function's scope. A bare `returning id into v_video_id` was ambiguous between that variable and the `sign_videos.id` column — caught only by actually running this against Postgres (the mocked unit tests never execute real SQL) — and is why the insert target needs an alias to disambiguate. `add_word_with_video` doesn't hit this, since its return columns are named `word_id`/`sign_id`/`sign_video_id`, not `id`.

## Grants

- `EXECUTE` revoked from `PUBLIC` and `anon`; granted to `authenticated`.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE OR REPLACE FUNCTION "public"."add_variant_with_video"("p_word_id" "uuid", "p_sign_id" "uuid", "p_variant_name" "text", "p_region" "text", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint) RETURNS TABLE("id" "uuid", "variant_name" "text", "region" "text", "is_primary" boolean, "video_id" "uuid", "video_storage_path" "text", "video_format" "text", "video_duration_ms" integer, "video_width" integer, "video_height" integer, "video_file_size" bigint)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
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

  insert into public.sign_videos as sv (sign_id, storage_path, format, duration_ms, width, height, file_size)
  values (p_sign_id, p_storage_path, p_format, p_duration_ms, p_width, p_height, p_file_size)
  returning sv.id into v_video_id;

  return query
    select p_sign_id, p_variant_name, v_region, false, v_video_id, p_storage_path, p_format, p_duration_ms, p_width, p_height, p_file_size;
end;
$$;

COMMENT ON FUNCTION "public"."add_variant_with_video"("p_word_id" "uuid", "p_sign_id" "uuid", "p_variant_name" "text", "p_region" "text", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint) IS 'Admin/superadmin-only (enforced by RLS on each insert): adds a new sign variant to an existing word plus the sign_videos row for its already-uploaded first video, in one transaction. The caller must upload the video to the sign-videos bucket (under p_sign_id) before calling this, and must delete that object if this call fails.';

REVOKE ALL ON FUNCTION "public"."add_variant_with_video"("p_word_id" "uuid", "p_sign_id" "uuid", "p_variant_name" "text", "p_region" "text", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."add_variant_with_video"("p_word_id" "uuid", "p_sign_id" "uuid", "p_variant_name" "text", "p_region" "text", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint) FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."add_variant_with_video"("p_word_id" "uuid", "p_sign_id" "uuid", "p_variant_name" "text", "p_region" "text", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint) TO "authenticated";
```
