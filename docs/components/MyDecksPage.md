# MyDecksPage

**Path:** `src/pages/MyDecksPage.tsx`
**Route:** `/my-decks` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** Lists the signed-in user's decks in two sections, and lets them play, edit, or remove each one. The "My Decks" section lists the caller's own custom decks from [useCustomDecks](../hooks/useCustomDecks.md), which can be edited or deleted. The "Saved Decks" section lists public decks the user added from [BrowseDecksPage](./BrowseDecksPage.md), which can only be removed from the library. Reached via the "My Decks" link in [NavBar](./NavBar.md); decks themselves are built on [CreateDeckPage](./CreateDeckPage.md).

**Props:** None — fetches its own data.

**Key behavior:** Two [DeckGrid](./DeckGrid.md)s render the sections. "My Decks" is fed by [useCustomDecks](../hooks/useCustomDecks.md), which is owner-scoped; "Saved Decks" is fed by [useSavedDecks](../hooks/useSavedDecks.md) and shows `"<deck name> — by <owner>"` when an owner name is present. In both sections `onSelect` navigates to `/flashcards/custom/:id`, the same route, since a saved deck is played exactly like the owner's own deck.

Editing an own deck: the "My Decks" `DeckGrid` passes `onEdit`, which sets `editingDeckId` and conditionally renders an [EditDeckModal](./EditDeckModal.md) for that id. `onSaved` maps the matching entry's `deck_name` in place through `setCustomDecks` from [useCustomDecks](../hooks/useCustomDecks.md), so the list reflects the new name without a refetch. Closing the modal clears `editingDeckId`. The "Saved Decks" `DeckGrid` does not get `onEdit`, because only a deck's owner can edit it.

Deletion of an own deck is a `deleted: Set<string>` of ids removed from view locally rather than refetching after a successful delete, so the grid updates immediately without a second round trip. `onDelete` sets `pendingDelete`, which opens a confirmation `Dialog` naming the deck; confirming calls `supabase.from('custom_decks').delete().eq('id', pendingDelete.id)` and, only on success, adds the id to `deleted`. Deleting the `custom_decks` row cascades to its [`custom_deck_words`](../db-schema/custom_deck_words.md), [`custom_deck_tags`](../db-schema/custom_deck_tags.md), [`saved_decks`](../db-schema/saved_decks.md) and [`deck_likes`](../db-schema/deck_likes.md) rows, so no separate cleanup call is needed.

Removing a saved deck is a separate flow: `pendingUnsave` opens a `Dialog` titled `Remove "<name>" from My Decks?`, and confirming deletes the caller's [`saved_decks`](../db-schema/saved_decks.md) row by `custom_deck_id`. On success the entry is removed from the hook's state via `setSavedDecks`. The deck itself is not touched.

The "Saved Decks" section uses `DeckGrid`'s `deleteActionLabel="Remove"`, so its buttons read "Remove \<name\>" rather than "Delete \<name\>".

**Depends on:** [useCustomDecks](../hooks/useCustomDecks.md), [useSavedDecks](../hooks/useSavedDecks.md), [DeckGrid](./DeckGrid.md), [EditDeckModal](./EditDeckModal.md), `Button`/`Dialog` (and its subcomponents) from `src/components/ui/`, `useNavigate` from `react-router-dom`, the `supabase` client.

**Tested by:** [docs/tests/MyDecksPage.md](../tests/MyDecksPage.md).
