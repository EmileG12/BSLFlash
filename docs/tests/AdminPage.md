# AdminPage.test.tsx

**Path:** `src/pages/AdminPage.test.tsx`
**Tests:** [AdminPage](../components/AdminPage.md)

## Coverage

Covers the "Add a new word" form (`AddWordForm`):

- When the video upload fails, shows `Video upload failed: … No changes were saved.` and makes no RPC call.
- When `add_word_with_video` fails and the compensating delete succeeds, shows the clean-rollback message and deletes the uploaded path.
- When the RPC fails and the compensating delete also fails, shows the message that names the orphaned storage path for manual cleanup.
- On success, uploads first, calls `add_word_with_video` with the generated sign id, and shows the success message.

## Notes

Mocks `../lib/supabase` (`from`, `rpc`) and the whole `../lib/signVideoUpload` module, so the upload internals are not exercised here. Those are covered by [signVideoUpload.test.ts](./signVideoUpload.md). The file input is located by its `aria-label="Video file"`.
