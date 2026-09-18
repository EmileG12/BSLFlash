# SelectDeckCard

**Path:** `src/components/SelectDeckCard.tsx`

**Purpose:** Card on [HomePage](./HomePage.md) titled "Select a deck", listing every flashcard category as a button so the user can pick a deck. Clicking a category navigates to [FlashcardPage](./FlashcardPage.md) (`/flashcards/:categoryId`) to start the guessing game for that category.

**Props:** None.

**Key behavior:** Uses [`useCategories`](../hooks/useCategories.md) to fetch categories, rendering one of: a loading message, an error message, an empty-state message, or a responsive grid of category buttons (one `Button` per category, `variant="outline"`, `onClick` navigates via `useNavigate`).

**Layout:** `src/components/SelectDeckCard.css` holds the component's custom CSS (via Tailwind `@apply`, `@reference "../index.css"` to pull in this project's theme/tokens for `@apply` to resolve against): the button grid uses `grid-template-columns: repeat(auto-fit, minmax(130px, 1fr))`, capped at 6 columns by the card's `max-w-4xl` (130px chosen so a 7th column can never fit within that width, while narrower viewports naturally wrap down to fewer columns). Hovering a category button drops the `hover:bg-muted` from the `outline` button variant and applies a `box-shadow: 0 8px 12px var(--shadow-color)` instead — the geometry is local to this component's CSS (it's the only thing using it), while the color itself (`--shadow-color`, defined in `src/index.css`'s `:root`/`.dark`) is a shared, reusable token like every other color in the project, available to any future shadow.

**Depends on:** [useCategories](../hooks/useCategories.md), `Card`/`Button` from `src/components/ui/`, `useNavigate` from `react-router-dom`.

**Tested by:** [docs/tests/SelectDeckCard.md](../tests/SelectDeckCard.md).
