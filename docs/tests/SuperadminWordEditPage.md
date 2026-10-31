# SuperadminWordEditPage.test.tsx

**Path:** `src/pages/SuperadminWordEditPage.test.tsx`
**Tests:** [SuperadminWordEditPage](../components/SuperadminWordEditPage.md)

## Coverage

Covers the upload-then-RPC flows in the two dialogs:

- **Add video (`AddVideoDialog`):**
  - When the upload fails, shows the upload message and makes no RPC call.
  - When `add_video_to_sign` fails and the compensating delete also fails, shows the message that names the orphaned storage path.
  - Uploads first, then calls `add_video_to_sign` with the variant's id and the upload result.
- **Add variant (`AddVariantDialog`):**
  - When the upload fails, shows the upload message and makes no RPC call.
  - When `add_variant_with_video` fails and the compensating delete succeeds, shows the clean-rollback message and deletes the uploaded path.
  - Uploads first, generates a sign id, and calls `add_variant_with_video`.

## Notes

Mocks `../lib/supabase` and the whole `../lib/signVideoUpload` module, so the upload internals are not exercised here. Those are covered by [signVideoUpload.test.ts](./signVideoUpload.md). The file inputs are located by their `aria-label="Video file"`.
