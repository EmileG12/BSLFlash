# signVideoUpload.test.ts

**Path:** `src/lib/signVideoUpload.test.ts`
**Tests:** [signVideoUpload](../utils/signVideoUpload.md)

## Coverage

- `uploadSignVideoFile` rejects a file that is not mp4 or webm before touching Storage.
- `uploadSignVideoFile` throws `Could not read the video file.` when metadata cannot be loaded, without uploading.
- `uploadSignVideoFile` throws the Storage error and returns no path when the upload fails.
- `uploadSignVideoFile` uploads under the given sign id and returns the metadata read from the video on success.
- `deleteSignVideoFile` resolves when the remove call actually removed the object (`data` contains the removed object).
- `deleteSignVideoFile` throws when the remove call fails.
- `deleteSignVideoFile` throws when the API reports no error but removed nothing (empty `data`) -- the shape Storage returns when RLS silently filters the object out, e.g. an admin without delete rights.

## Notes

Mocks `./supabase`'s `storage.from` via an explicit factory. jsdom does not load video metadata, so the test stubs `document.createElement('video')` and `URL.createObjectURL`/`revokeObjectURL`. Assigning `src` on the stub synchronously fires `onloadedmetadata` (with fixed duration and dimensions) or `onerror`. Without this, the metadata step would never settle.
