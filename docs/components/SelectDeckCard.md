# SelectDeckCard

**Path:** `src/components/SelectDeckCard.tsx`

**Purpose:** Lists flashcard categories as buttons so the user can pick a deck. [HomePage](./HomePage.md) renders two instances — one for topic categories, one for vocabulary-requirement categories (see [categories](../db-schema/categories.md)) — each independently fetching and showing only its own kind. Clicking a category navigates to [ModeSelectPage](./ModeSelectPage.md) (`/flashcards/standard/:categoryId`) to choose a game mode for that category.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `vocabulary` | `boolean` | `false` lists topic categories (Animals, Greetings, ...); `true` lists vocabulary-requirement categories (e.g. GCSE). |
| `title` | `string?` | Heading. Defaults to `"Select a deck"`. |
| `icon` | `ReactNode?` | Passed straight through to [DeckGrid](./DeckGrid.md)'s `icon`. |
| `subtitle` | `string?` | Passed straight through to [DeckGrid](./DeckGrid.md)'s `subtitle`. |
| `variant` | `'card' \| 'bare'?` | Passed straight through to [DeckGrid](./DeckGrid.md)'s `variant`. Defaults to `'card'` when omitted (`DeckGrid`'s own default), matching a standalone card like HomePage's original layout. |
| `search` | `string?` | Case-insensitive substring filter on `category_name`, applied client-side to the already-fetched `categories`. Omit or pass `''` to show all. |

**Key behavior:** A thin wrapper around [DeckGrid](./DeckGrid.md): uses [`useCategories`](../hooks/useCategories.md) (passing `vocabulary` through) to fetch the matching categories, filters them by `search` (if given) with a case-insensitive substring match on `category_name`, maps the result to `DeckGrid`'s `{ id, name }` item shape, and passes `onSelect={(id) => navigate(`/flashcards/standard/${id}`)}` — the hardcoded `standard` segment is what tells [ModeSelectPage](./ModeSelectPage.md)/[FlashcardPage](./FlashcardPage.md)/[TenCardsPage](./TenCardsPage.md) this deck is a `public.categories` row, not a [custom deck](./MyDecksPage.md). All of the loading/error/empty rendering and grid/button markup, plus the icon/subtitle/card-vs-bare presentation, now lives in `DeckGrid`, which this component no longer owns.

When `search` is non-empty and matches nothing, `emptyMessage` becomes `No categories match "{search}".` instead of the default `No categories yet.` — [DeckGrid](./DeckGrid.md) still renders (not hidden) in this case, so a group's heading and the divider around it stay visible even with zero results. [HomePage](./HomePage.md) holds one `search` string and passes it to both of its `SelectDeckCard` instances, so the two category lists are filtered independently rather than merged first.

**Depends on:** [useCategories](../hooks/useCategories.md), [DeckGrid](./DeckGrid.md), `useNavigate` from `react-router-dom`.

**Tested by:** [docs/tests/SelectDeckCard.md](../tests/SelectDeckCard.md).
