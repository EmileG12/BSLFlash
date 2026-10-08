# SelectDeckCard

**Path:** `src/components/SelectDeckCard.tsx`

**Purpose:** Card on [HomePage](./HomePage.md), listing flashcard categories as buttons so the user can pick a deck. [HomePage](./HomePage.md) renders two instances — one for topic categories, one for vocabulary-requirement categories (see [categories](../db-schema/categories.md)) — each independently fetching and showing only its own kind. Clicking a category navigates to [ModeSelectPage](./ModeSelectPage.md) (`/flashcards/standard/:categoryId`) to choose a game mode for that category.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `vocabulary` | `boolean` | `false` lists topic categories (Animals, Greetings, ...); `true` lists vocabulary-requirement categories (e.g. GCSE). |
| `title` | `string?` | Card heading. Defaults to `"Select a deck"`. |

**Key behavior:** A thin wrapper around [DeckGrid](./DeckGrid.md): uses [`useCategories`](../hooks/useCategories.md) (passing `vocabulary` through) to fetch the matching categories, maps each to `DeckGrid`'s `{ id, name }` item shape, and passes `onSelect={(id) => navigate(`/flashcards/standard/${id}`)}` — the hardcoded `standard` segment is what tells [ModeSelectPage](./ModeSelectPage.md)/[FlashcardPage](./FlashcardPage.md)/[TenCardsPage](./TenCardsPage.md) this deck is a `public.categories` row, not a [custom deck](./MyDecksPage.md). All of the loading/error/empty rendering and grid/button markup now lives in `DeckGrid`, which this component no longer owns.

**Depends on:** [useCategories](../hooks/useCategories.md), [DeckGrid](./DeckGrid.md), `useNavigate` from `react-router-dom`.

**Tested by:** [docs/tests/SelectDeckCard.md](../tests/SelectDeckCard.md).
