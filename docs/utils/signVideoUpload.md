# signVideoUpload

**Path:** `src/lib/signVideoUpload.ts`
**Signature:** `uploadSignVideo(signId: string, file: File): Promise<{ id: string; storage_path: string; format: string; duration_ms: number; width: number; height: number; file_size: number }>`

**Purpose:** Uploads one video file to the [`sign-videos`](../storage/sign-videos.md) bucket and inserts its [`sign_videos`](../db-schema/sign_videos.md) row under the given sign. Shared by [AdminPage](../components/AdminPage.md) (a new word's first variant and video) and [SuperadminWordEditPage](../components/SuperadminWordEditPage.md) (further videos and variants), so the metadata and upload-path logic lives in one place.

**Key behavior:**
- **Format check first.** Only `video/mp4` and `video/webm` are accepted, mapped to `mp4`/`webm`. Anything else throws before any network call. This matches the bucket's `allowed_mime_types` and the `sign_videos.format` check.
- **Metadata is read in the browser.** `duration_ms`, `width` and `height` come from an HTML5 `<video>` element's loaded metadata, read from an object URL that is revoked afterwards. There is no server-side probe for browser uploads. The seeding path, [`scripts/seed-sign-videos.mjs`](../storage/sign-videos.md), reads the same values with `ffprobe-static` instead, because it works from local files.
- **Storage path is `<signId>/<uuid>.<format>`.** A random UUID per file means two takes under the same sign never collide. The path does not follow the `<word>/<variant>.<ext>` convention used by the seed script (see [sign-videos](../storage/sign-videos.md)).
- **Upload before insert.** The object is uploaded first and then the row is inserted. If the insert fails, the uploaded object is not removed, so an orphaned object can remain in the bucket.

**Edge cases handled:** An unreadable file rejects with `Could not read the video file.` from the metadata step, before anything is uploaded.

**Depends on:** [supabase-client](./supabase-client.md), the `sign-videos` bucket policies (insert requires `is_superadmin() OR is_admin()`), the `sign_videos` insert policy.

**Used by:** [AdminPage](../components/AdminPage.md), [SuperadminWordEditPage](../components/SuperadminWordEditPage.md).
