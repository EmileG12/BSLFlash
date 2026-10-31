# AdminPage.test.tsx

**Path:** `src/pages/AdminPage.test.tsx`
**Tests:** [AdminPage](../components/AdminPage.md)

## Coverage

Covers the "Add a new word" form (`AddWordForm`):

- When the video upload fails, shows `Video upload failed: … No changes were saved.` and makes no RPC call.
- When `add_word_with_video` fails and the compensating delete succeeds, shows the clean-rollback message and deletes the uploaded path.
- When the RPC fails and the compensating delete also fails, shows the message that names the orphaned storage path for manual cleanup.
- On success, uploads first, calls `add_word_with_video` with the generated sign id, and shows the success message.

Covers category editing (`EditWordCategoriesRow`), draft/commit behavior:

- Toggling a tag chip updates its pressed state but makes no `supabase.rpc` call.
- **Revert changes** restores the saved selection, makes no database call, and both action buttons are disabled once the draft matches the saved copy again.
- **Save edit** sends the entire draft to [`set_word_categories`](../rpc-functions/set_word_categories.md) in a single `supabase.rpc` call, then the draft becomes the new saved copy and **Save edit** is disabled again.
- When the RPC call fails, the error is shown in an alert and the draft (and enabled **Save edit** button, and the still-selected tags) are left untouched.

## Notes

Mocks `../lib/supabase` (`from`, `rpc`) and the whole `../lib/signVideoUpload` module, so the upload internals are not exercised here. Those are covered by [signVideoUpload.test.ts](./signVideoUpload.md). The file input is located by its `aria-label="Video file"`.

The category-editing tests scope all queries to the admin table (`within(screen.getByRole('table'))`) because `AddWordForm`'s own `TagPicker` renders a same-named "Tags" group higher on the page — `TagChipList` reuses one static `headingId` across every instance, so an unscoped query matches both.
