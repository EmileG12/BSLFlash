# sign-videos

**Declared in:** [`supabase/config.toml`](../../supabase/config.toml) `[storage.buckets.sign-videos]`
**Policies added by migration:** [`20260918115717_create_sign_videos_storage_policies.sql`](../../supabase/migrations/20260918115717_create_sign_videos_storage_policies.sql)

**Purpose:** Stores the video files demonstrating each [sign](../db-schema/signs.md), referenced by [`sign_videos.storage_path`](../db-schema/sign_videos.md). This is the first Storage bucket in the project.

## Configuration

```toml
[storage.buckets.sign-videos]
public = true
file_size_limit = "50MiB"
allowed_mime_types = ["video/mp4", "video/webm"]
```

- **Public:** yes. Sign videos aren't sensitive, so the client builds a playable URL directly from `storage_path` (`<API_URL>/storage/v1/object/public/sign-videos/<storage_path>`) with no signed-URL logic needed. A public bucket only affects *reads* — reads are served without going through RLS at all. Writes always go through `storage.objects` RLS regardless of bucket visibility, so this does not loosen upload access (see policies below).
- **`allowed_mime_types`:** restricted to `video/mp4`/`video/webm`, matching the [`sign_videos.format`](../db-schema/sign_videos.md) check constraint — a non-video upload is rejected by the Storage API itself (`415 invalid_mime_type`), not just by the database.
- **Path convention:** `<word>/<variant>.<ext>`, e.g. `hello/standard.mp4`. Not enforced by the database — purely a convention followed by `scripts/seed-sign-videos.mjs` and expected of anything uploaded later.

## Row Level Security (`storage.objects`, scoped to this bucket)

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| `sign_videos_bucket_select_authenticated` | SELECT | authenticated | Any logged-in user can read object rows (in addition to the public URL read path above). |
| `sign_videos_bucket_insert_admin_or_superadmin` | INSERT | authenticated | Admin or superadmin (via [`is_superadmin()`](../rpc-functions/is_superadmin.md) OR [`is_admin()`](../rpc-functions/is_admin.md)). |
| `sign_videos_bucket_update_superadmin` | UPDATE | authenticated | Superadmin only. |
| `sign_videos_bucket_delete_superadmin` | DELETE | authenticated | Superadmin only. |

All four policies are written `to authenticated` (never `to public`/`anon`), so an unauthenticated upload attempt matches no policy and is rejected by RLS's default-deny before `is_superadmin()` is even evaluated. Verified directly against the local stack: anon upload → rejected; authenticated non-superadmin upload → rejected; superadmin upload → succeeds.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "sign_videos_bucket_select_authenticated" ON "storage"."objects" FOR SELECT TO "authenticated" USING (("bucket_id" = 'sign-videos'::"text"));

CREATE POLICY "sign_videos_bucket_insert_admin_or_superadmin" ON "storage"."objects" FOR INSERT TO "authenticated" WITH CHECK ((("bucket_id" = 'sign-videos'::"text") AND ("public"."is_superadmin"() OR "public"."is_admin"())));

CREATE POLICY "sign_videos_bucket_update_superadmin" ON "storage"."objects" FOR UPDATE TO "authenticated" USING ((("bucket_id" = 'sign-videos'::"text") AND "public"."is_superadmin"())) WITH CHECK ((("bucket_id" = 'sign-videos'::"text") AND "public"."is_superadmin"()));

CREATE POLICY "sign_videos_bucket_delete_superadmin" ON "storage"."objects" FOR DELETE TO "authenticated" USING ((("bucket_id" = 'sign-videos'::"text") AND "public"."is_superadmin"()));
```

## Seeding sample content

`supabase/config.toml`/`supabase/migrations/` and `supabase/seed.sql` don't cover binary file uploads, so sample videos are seeded by a separate script, chained after `db reset` via `npm run db:reset:seeded`:

- `supabase/seed.sql` inserts the "Greetings" category, "Hello"/"World" words, and their `signs` rows, each with `is_primary = true` (fixed UUIDs, pure SQL — re-applies automatically on every `db reset`).
- [`scripts/seed-sign-videos.mjs`](../../scripts/seed-sign-videos.mjs) uploads `vids/hellosign.mp4`/`vids/world.mp4` to this bucket (using the local service role key, which bypasses RLS) and inserts their matching `sign_videos` rows, with real `duration_ms`/`width`/`height`/`file_size` read off the files via `ffprobe-static`. Run manually (or via `npm run db:reset:seeded`) after every reset — it is not itself part of `db reset`.
