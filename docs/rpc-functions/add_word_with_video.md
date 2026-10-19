# add_word_with_video

**Signature:** `public.add_word_with_video(p_word text, p_definition text, p_sign_id uuid, p_storage_path text, p_format text, p_duration_ms integer, p_width integer, p_height integer, p_file_size bigint, p_category_ids uuid[] DEFAULT '{}') RETURNS TABLE(word_id uuid, sign_id uuid, sign_video_id uuid)`
**Language:** PL/pgSQL, `SET search_path = public` (not `SECURITY DEFINER`)
**Created by migration:** [`20261018234007_create_atomic_add_word_video_functions.sql`](../../supabase/migrations/20261018234007_create_atomic_add_word_video_functions.sql)

**Purpose:** Creates a new word with its first sign variant and that variant's video, all in one transaction. Inserts `words`, a `signs` row named `Standard` with `is_primary = true`, the `sign_videos` row, and optionally `word_categories` links. Called from the "Add a new word" form on [AdminPage](../components/AdminPage.md).

**Why it exists at all:** the video has to be uploaded to [Storage](../storage/sign-videos.md) before any database row exists, and Storage is not part of a Postgres transaction. Issued as separate client requests, a failure partway through left the word and sign committed with no video. One function call covers every database write, so a failure rolls them all back together.

**Why the sign id is a parameter:** the storage path convention is `<sign_id>/<file>.<ext>`. The client generates the sign's UUID, uploads under that path, then passes the same UUID here so the `signs` row gets that exact id instead of a server-generated one.

**Why not `SECURITY DEFINER`:** the function runs as the caller. The existing `*_insert_admin_or_superadmin` policies on `words`, `signs`, `sign_videos` and `word_categories` apply to each insert exactly as if the client had issued it directly, so a non-admin caller gets Postgres's ordinary RLS-denial error. See [words_insert_admin_or_superadmin](../rls-policies/words/words_insert_admin_or_superadmin.md).

**Client-side compensation:** if this call fails, the caller deletes the already-uploaded object via [deleteSignVideoFile](../utils/signVideoUpload.md). The database cannot cover that step.

## Grants

- `EXECUTE` revoked from `PUBLIC` and `anon`; granted to `authenticated`.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE OR REPLACE FUNCTION "public"."add_word_with_video"("p_word" "text", "p_definition" "text", "p_sign_id" "uuid", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint, "p_category_ids" "uuid"[] DEFAULT '{}'::"uuid"[]) RETURNS TABLE("word_id" "uuid", "sign_id" "uuid", "sign_video_id" "uuid")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
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

COMMENT ON FUNCTION "public"."add_word_with_video"("p_word" "text", "p_definition" "text", "p_sign_id" "uuid", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint, "p_category_ids" "uuid"[]) IS 'Admin/superadmin-only (enforced by RLS on each insert): creates a word with its first ("Standard", primary) sign variant, the sign_videos row for an already-uploaded video, and optional category tags, all in one transaction. The caller must upload the video to the sign-videos bucket (under p_sign_id) before calling this, and must delete that object if this call fails.';

REVOKE ALL ON FUNCTION "public"."add_word_with_video"("p_word" "text", "p_definition" "text", "p_sign_id" "uuid", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint, "p_category_ids" "uuid"[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."add_word_with_video"("p_word" "text", "p_definition" "text", "p_sign_id" "uuid", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint, "p_category_ids" "uuid"[]) FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."add_word_with_video"("p_word" "text", "p_definition" "text", "p_sign_id" "uuid", "p_storage_path" "text", "p_format" "text", "p_duration_ms" integer, "p_width" integer, "p_height" integer, "p_file_size" bigint, "p_category_ids" "uuid"[]) TO "authenticated";
```
