# ModeSelectPage

**Path:** `src/pages/ModeSelectPage.tsx`
**Route:** `/flashcards/:categoryId` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** Sits between picking a category ([SelectDeckCard](./SelectDeckCard.md)) and actually playing — lets the user choose "Practice" or "10 Cards" for the category they just picked.

**Props:** None — reads `categoryId` from the URL via `useParams`.

**Key behavior:** Two buttons, navigating to the sibling routes for that same category: `/flashcards/:categoryId/practice` ([FlashcardPage](./FlashcardPage.md)) and `/flashcards/:categoryId/ten-cards` ([TenCardsPage](./TenCardsPage.md)). No data fetching of its own. Card, grid, and button styling reuse [SelectDeckCard](./SelectDeckCard.md)'s CSS classes (`select-deck-card`/`select-deck-grid`/`select-deck-button`) so both look identical; the page wraps its content in the same centering layout (`mx-auto flex max-w-4xl flex-col gap-6 p-4`) as [HomePage](./HomePage.md).

**Depends on:** `Card`/`Button` from `src/components/ui/`, `useNavigate`/`useParams` from `react-router-dom`, `src/components/SelectDeckCard.css`.
