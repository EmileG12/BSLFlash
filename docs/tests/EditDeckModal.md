# EditDeckModal.test.tsx

**Path:** `src/components/EditDeckModal.test.tsx`
**Tests:** [EditDeckModal](../components/EditDeckModal.md)

## Coverage

- Shows "Loading deck..." before the deck detail resolves.
- Pre-fills the name, the publish checkbox state, the selected words, and the selected tags from the deck detail.
- Toggling the "Published" checkbox makes no RPC call; the change is held locally until Save.
- Disables the "Published" checkbox, with the "Add at least one word to publish this deck." hint, once the last word is removed.
- Saves the rename, word list, and publish state through `update_custom_deck` (with `p_is_public`), then calls `onSaved` with the trimmed name and `onClose`.
- Calls `onClose` when Cancel is clicked.

Not covered: the tag add/remove writes made on Save, and failure paths after the rename has succeeded.

## Notes

Mocks `../lib/supabase` with both `from` and `rpc`. A `mockBackend` helper dispatches `from` by table name, covering `custom_decks` (`select().eq().single()`), `custom_deck_words` and `custom_deck_tags` (`select().eq()`), `categories` (`select().order()`), and the words list (`select().order()`). It also stubs `delete().eq().in()` and `insert()`. The Save case leaves the tag selection unchanged, so the tag write path does not run. Renders via [renderWithQueryClient](./renderWithQueryClient.md), since the modal's tag picker uses [useAllCategories](../hooks/useAllCategories.md), which requires a `QueryClientProvider` ancestor.
