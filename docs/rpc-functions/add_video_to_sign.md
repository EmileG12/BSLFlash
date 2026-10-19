# add_video_to_sign

**Signature:** `public.add_video_to_sign(p_sign_id uuid, p_storage_path text, p_format text, p_duration_ms integer, p_width integer, p_height integer, p_file_size bigint) RETURNS TABLE(id uuid, storage_path text, format text, duration_ms integer, width integer, height integer, file_size bigint)`
**Language:** PL/pgSQL, `SET search_path = public` (not `SECURITY DEFINER`)
**Created by migration:** [`20261018234007_create_atomic_add_word_video_functions.sql`](../../supabase/migrations/20261018234007_create_atomic_add_word_video_functions.sql)

**Purpose:** Adds one more `sign_videos` row to an existing sign variant, for a video that has already been uploaded to [Storage](../storage/sign-videos.md). Called from the "Add video" dialog on [SuperadminWordEditPage](../components/SuperadminWordEditPage.md).

**Why it is a function and not a plain insert:** kept as its own function so the client's upload-then-write-then-cleanup handling is uniform across all three add paths.

**Return value:** the new video row's own columns (`id`, `storage_path`, `format`, `duration_ms`, `width`, `height`, `file_size`), not wrapped in a sub-object.

**Why not `SECURITY DEFINER`:** the function runs as the caller, so the `sign_videos_insert_admin_or_superadmin` policy applies to the insert as if the client had issued it directly. See [sign_videos_insert_admin_or_superadmin](../rls-policies/sign_videos/sign_videos_insert_admin_or_superadmin.md).

**Client-side compensation:** if this call fails, the caller deletes the already-uploaded object via [deleteSignVideoFile](../utils/signVideoUpload.md).

## Grants

- `EXECUTE` revoked from `PUBLIC` and `anon`; granted to `authenticated`.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE OR REPLACE FUNCTION "public"."add_video_to_sign"("p_sign_id" "uuid", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint) RETURNS TABLE("id" "uuid", "storage_path" "text", "format" "text", "duration_ms" integer, "width" integer, "height" integer, "file_size" bigint)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_video_id uuid;
begin
  insert into public.sign_videos (sign_id, storage_path, format, duration_ms, width, height, file_size)
  values (p_sign_id, p_storage_path, p_format, p_duration_ms, p_width, p_height, p_file_size)
  returning id into v_video_id;

  return query select v_video_id, p_storage_path, p_format, p_duration_ms, p_width, p_height, p_file_size;
end;
$$;

COMMENT ON FUNCTION "public"."add_video_to_sign"("p_sign_id" "uuid", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint) IS 'Admin/superadmin-only (enforced by RLS): adds another video to an existing sign variant for its already-uploaded file, as a single-statement transaction. Kept as its own function (rather than a plain insert) so the client''s upload-then-write-then-cleanup-on-failure handling is uniform across all three add-video paths. The caller must upload the video to the sign-videos bucket (under p_sign_id) before calling this, and must delete that object if this call fails.';

REVOKE ALL ON FUNCTION "public"."add_video_to_sign"("p_sign_id" "uuid", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."add_video_to_sign"("p_sign_id" "uuid", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint) FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."add_video_to_sign"("p_sign_id" "uuid", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint) TO "authenticated";
```
