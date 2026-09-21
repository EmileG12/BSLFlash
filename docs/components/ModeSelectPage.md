# ModeSelectPage

**Path:** `src/pages/ModeSelectPage.tsx`
**Route:** `/flashcards/:categoryId` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** Sits between picking a category ([SelectDeckCard](./SelectDeckCard.md)) and actually playing — lets the user choose "Practice" or "10 Cards" for the category they just picked.

**Props:** None — reads `categoryId` from the URL via `useParams`.

**Key behavior:** Two buttons, navigating to the sibling routes for that same category: `/flashcards/:categoryId/practice` ([FlashcardPage](./FlashcardPage.md)) and `/flashcards/:categoryId/ten-cards` ([TenCardsPage](./TenCardsPage.md)). No data fetching of its own.

**Depends on:** `Card`/`Button` from `src/components/ui/`, `useNavigate`/`useParams` from `react-router-dom`.
