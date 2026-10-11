# MyDecksPage.test.tsx

**Path:** `src/pages/MyDecksPage.test.tsx`
**Tests:** [MyDecksPage](../components/MyDecksPage.md)

## Coverage

- Shows an empty state in each section when the user has no owned decks and no saved decks.
- Renders a button per owned deck and navigates to `/flashcards/custom/:categoryId` on selection.
- Deletes an owned deck after confirming in the dialog — the deleted deck's button disappears.
- Keeps the owned deck when the delete dialog is cancelled.
- Renders saved decks in their own "Saved Decks" section, labelled with the owner (`"GCSE Pack — by bob"`).
- Removes a saved deck after confirming in the "Remove" dialog — its button disappears.
- Opens the "Edit deck" modal from an owned deck's Edit button.
- Offers no Edit button on saved decks.

## Notes

Mocks `../lib/supabase` with `from`, `rpc`, and `auth.getUser`. `getUser` resolves a fixed user, because [useCustomDecks](../hooks/useCustomDecks.md) now filters by the signed-in user's id. The `from` mock is a table-aware implementation: `custom_decks` returns a `select().eq()` result that serves both the `.order()` list (behind [useCustomDecks](../hooks/useCustomDecks.md)) and the `.single()` detail read, while `custom_deck_words`/`custom_deck_tags` resolve empty. It also covers the `categories` and words reads that [EditDeckModal](../components/EditDeckModal.md) makes once opened. A `delete().eq()` chain serves both the owned-deck delete and the saved-deck remove. The `rpc` mock resolves `get_saved_decks` for [useSavedDecks](../hooks/useSavedDecks.md). Renders inside a `MemoryRouter`/`Routes` with a stub `/flashcards/custom/:categoryId` route to assert the selection navigation against, same convention as [SelectDeckCard.test.tsx](./SelectDeckCard.md).
