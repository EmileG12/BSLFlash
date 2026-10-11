# EditDeckModal.test.tsx

**Path:** `src/components/EditDeckModal.test.tsx`
**Tests:** [EditDeckModal](../components/EditDeckModal.md)

## Coverage

- Shows "Loading deck..." before the deck detail resolves.
- Pre-fills the name, the publish state, the selected words, and the selected tags from the deck detail.
- Toggles publish immediately by calling `set_custom_deck_public`, without Save, and shows "Published" once it succeeds.
- Saves the rename and word list through `update_custom_deck`, then calls `onSaved` with the trimmed name and `onClose`.
- Calls `onClose` when Cancel is clicked.

Not covered: the tag add/remove writes made on Save, and failure paths after the rename has succeeded.

## Notes

Mocks `../lib/supabase` with both `from` and `rpc`. A `mockBackend` helper dispatches `from` by table name, covering `custom_decks` (`select().eq().single()`), `custom_deck_words` and `custom_deck_tags` (`select().eq()`), `categories` (`select().order()`), and the words list (`select().order()`). It also stubs `delete().eq().in()` and `insert()`. The Save case leaves the tag selection unchanged, so the tag write path does not run.
