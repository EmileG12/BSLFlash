# SelectDeckCard

**Path:** `src/components/SelectDeckCard.tsx`

**Purpose:** Card on [HomePage](./HomePage.md), listing flashcard categories as buttons so the user can pick a deck. [HomePage](./HomePage.md) renders two instances — one for topic categories, one for vocabulary-requirement categories (see [categories](../db-schema/categories.md)) — each independently fetching and showing only its own kind. Clicking a category navigates to [ModeSelectPage](./ModeSelectPage.md) (`/flashcards/:categoryId`) to choose a game mode for that category.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `vocabulary` | `boolean` | `false` lists topic categories (Animals, Greetings, ...); `true` lists vocabulary-requirement categories (e.g. GCSE). |
| `title` | `string?` | Card heading. Defaults to `"Select a deck"`. |

**Key behavior:** Uses [`useCategories`](../hooks/useCategories.md) (passing `vocabulary` through) to fetch the matching categories, rendering one of: a loading message, an error message, an empty-state message, or a responsive grid of category buttons (one `Button` per category, `variant="outline"`, `onClick` navigates via `useNavigate`).

**Layout:** `src/components/SelectDeckCard.css` holds the component's custom CSS (via Tailwind `@apply`, `@reference "../index.css"` to pull in this project's theme/tokens for `@apply` to resolve against): the button grid uses `grid-template-columns: repeat(auto-fit, minmax(130px, 1fr))`, capped at 6 columns by the card's `max-w-4xl` (130px chosen so a 7th column can never fit within that width, while narrower viewports naturally wrap down to fewer columns). Hovering a category button drops the `hover:bg-muted` from the `outline` button variant and applies a `box-shadow: 0 8px 12px var(--shadow-color)` instead — the geometry is local to this component's CSS (it's the only thing using it), while the color itself (`--shadow-color`, defined in `src/index.css`'s `:root`/`.dark`) is a shared, reusable token like every other color in the project, available to any future shadow.

**Depends on:** [useCategories](../hooks/useCategories.md), `Card`/`Button` from `src/components/ui/`, `useNavigate` from `react-router-dom`.

**Tested by:** [docs/tests/SelectDeckCard.md](../tests/SelectDeckCard.md).
