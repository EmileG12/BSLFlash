# MyDecksPage.test.tsx

**Path:** `src/pages/MyDecksPage.test.tsx`
**Tests:** [MyDecksPage](../components/MyDecksPage.md)

## Coverage

- Shows an empty state when the user has no custom decks.
- Renders a button per custom deck and navigates to `/flashcards/custom/:categoryId` on selection.
- Deletes a deck after confirming in the dialog — the deleted deck's button disappears.
- Keeps the deck when the delete dialog is cancelled.

## Notes

Mocks `../lib/supabase` (`supabase.from`) via an explicit factory supporting both the `select().order()` chain (behind [useCustomCategories](../hooks/useCustomCategories.md)) and the `delete().eq()` chain (the page's own delete call). Renders inside a `MemoryRouter`/`Routes` with a stub `/flashcards/custom/:categoryId` route to assert the selection navigation against, same convention as [SelectDeckCard.test.tsx](./SelectDeckCard.md).
