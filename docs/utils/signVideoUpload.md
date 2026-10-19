# signVideoUpload

**Path:** `src/lib/signVideoUpload.ts`
**Signature:**

```ts
uploadSignVideoFile(signId: string, file: File): Promise<UploadedSignVideoFile>
deleteSignVideoFile(storagePath: string): Promise<void>

interface UploadedSignVideoFile {
  storagePath: string
  format: 'mp4' | 'webm'
  metadata: { durationMs: number; width: number; height: number }
}
```

**Purpose:** The Storage half of the video-upload flow on [AdminPage](../components/AdminPage.md) and [SuperadminWordEditPage](../components/SuperadminWordEditPage.md). `uploadSignVideoFile` puts a file in the [`sign-videos`](../storage/sign-videos.md) bucket and returns what the matching [`sign_videos`](../db-schema/sign_videos.md) row needs. It does not write that row. `deleteSignVideoFile` removes an uploaded object, and is used to undo an upload when the database write fails.

**Key behavior:**
- **The module never writes a database row.** Each caller then passes the result to one of the atomic RPCs: [add_word_with_video](../rpc-functions/add_word_with_video.md), [add_variant_with_video](../rpc-functions/add_variant_with_video.md) or [add_video_to_sign](../rpc-functions/add_video_to_sign.md). Storage is not part of a Postgres transaction, so the row write has to be separate from the upload, and the RPC is where the database side is all-or-nothing.
- **Sequence is upload, then RPC, then compensate on failure.** The caller uploads first. If the RPC fails, the caller calls `deleteSignVideoFile` with the uploaded path. An upload failure writes nothing, so there is nothing to undo.
- **The sign id comes from the caller.** On the add-word and add-variant paths the caller generates the id before the row exists. That is what lets the storage path be built before the insert, and the same id is passed to the RPC so the row gets that exact id.
- **Format check first.** Only `video/mp4` and `video/webm` are accepted, mapped to `mp4`/`webm`. Anything else throws before any network call. This matches the bucket's `allowed_mime_types` and the `sign_videos.format` check.
- **Metadata is read in the browser.** `durationMs`, `width` and `height` come from an HTML5 `<video>` element's loaded metadata, read from an object URL that is revoked afterwards. There is no server-side probe for browser uploads. The seeding path, [`scripts/seed-sign-videos.mjs`](../storage/sign-videos.md), reads the same values with `ffprobe-static` instead, because it works from local files.
- **Storage path is `<signId>/<uuid>.<format>`.** A random UUID per file means two takes under the same sign never collide. The path does not follow the `<word>/<variant>.<ext>` convention used by the seed script (see [sign-videos](../storage/sign-videos.md)).
- **`deleteSignVideoFile` throws if the remove fails, or if it reports no error but removed nothing.** The Storage API returns success with an empty `data` array (not an error) when RLS silently filters the object out of the delete — which is exactly what happens when an admin (not superadmin) tries to clean up their own failed upload, since the bucket's delete policy is superadmin-only. Checking `data.length` as well as `error` is what lets the caller tell a genuine clean rollback apart from "nothing was deleted and the caller has no way to know why."

**Edge cases handled:**
- A file that is not mp4 or webm rejects before metadata is read or anything is uploaded.
- An unreadable file rejects with `Could not read the video file.` from the metadata step, before anything is uploaded.
- A Storage error from the upload propagates unchanged and no path is returned, so the caller cannot run its compensation step on an upload that never happened.

**Depends on:** [supabase-client](./supabase-client.md), the `sign-videos` bucket policies (insert requires `is_superadmin() OR is_admin()`; delete requires `is_superadmin()`). `deleteSignVideoFile` is also called from the admin add-word path, where an admin (not superadmin) cleaning up their own failed upload is denied by the delete policy -- that denial comes back as an empty `data` array with no `error`, which `deleteSignVideoFile` treats as a failed delete (see above), so the admin is correctly told the file needs manual cleanup rather than being falsely told the rollback was clean.

**Used by:** [AdminPage](../components/AdminPage.md) (add word), [SuperadminWordEditPage](../components/SuperadminWordEditPage.md) (add video, add variant).
