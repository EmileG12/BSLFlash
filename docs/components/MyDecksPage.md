# MyDecksPage

**Path:** `src/pages/MyDecksPage.tsx`
**Route:** `/my-decks` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** Lists the signed-in user's custom decks and lets them play or delete each one. Reached via the "My Decks" link in [NavBar](./NavBar.md); decks themselves are built on [CreateDeckPage](./CreateDeckPage.md).

**Props:** None — fetches its own data.

**Key behavior:** Uses [useCustomCategories](../hooks/useCustomCategories.md) to fetch the user's decks, renders them via [DeckGrid](./DeckGrid.md) — `onSelect` navigates to `/flashcards/custom/:categoryId` (the `custom` segment marking it as a `custom_categories` deck rather than a standard one — see [SelectDeckCard](./SelectDeckCard.md) for the counterpart), and `onDelete` opens a confirmation dialog for that item. One list serves both actions; there's no separate delete-only list.

Deletion is a `deleted: Set<string>` of ids removed from view locally rather than refetching from `useCustomCategories` after a successful delete, so the grid updates immediately without a second round trip. `onDelete` sets `pendingDelete: DeckGridItem | null`, which opens a confirmation `Dialog` naming the deck (`Delete "X"?`); confirming calls `supabase.from('custom_categories').delete().eq('id', pendingDelete.id)` and, only on success, adds the id to `deleted`. Deleting the `custom_categories` row cascades to its [`custom_category_words`](../db-schema/custom_category_words.md) links automatically (`ON DELETE CASCADE`), so no separate cleanup call is needed here.

**Depends on:** [useCustomCategories](../hooks/useCustomCategories.md), [DeckGrid](./DeckGrid.md), `Button`/`Dialog` (and its subcomponents) from `src/components/ui/`, `useNavigate` from `react-router-dom`.

**Tested by:** [docs/tests/MyDecksPage.md](../tests/MyDecksPage.md).
