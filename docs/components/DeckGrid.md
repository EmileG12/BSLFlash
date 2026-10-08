# DeckGrid

**Path:** `src/components/DeckGrid.tsx`

**Purpose:** Presentational card listing decks as buttons; clicking one hands its id to `onSelect`. Extracted out of [SelectDeckCard](./SelectDeckCard.md) so it and [MyDecksPage](./MyDecksPage.md) (which lists custom decks) can render the same markup/styling without duplicating it — `SelectDeckCard` is now a thin wrapper around this component.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `title` | `string` | Card heading. |
| `items` | `DeckGridItem[]` (`{ id: string; name: string }`) | Decks to list, already resolved to plain id/name pairs — this component doesn't know or care whether they came from `categories` or `custom_categories`. |
| `loading` | `boolean` | Shows a loading message in place of the grid. |
| `error` | `string \| null` | Shows an error message in place of the grid. |
| `emptyMessage` | `string` | Shown instead of the grid when `items` is empty (and not loading/erroring) — lets each caller phrase its own empty state (e.g. "No categories yet." vs. "You haven't created any decks yet."). |
| `onSelect` | `(id: string) => void` | Called with the clicked item's `id`. |

**Key behavior:** Renders one of: a loading message, an error message, an empty-state message, or a responsive grid of buttons (one per item, `variant="outline"`), inside a `Card`/`CardHeader`/`CardContent`. Has no data-fetching or navigation of its own — both are the caller's job (`SelectDeckCard` passes `useCategories`-derived items and navigates via `onSelect`; `MyDecksPage` passes `useCustomCategories`-derived items).

**Layout:** Reuses `src/components/SelectDeckCard.css`'s classes (`select-deck-card`/`select-deck-grid`/`select-deck-button`) rather than a new stylesheet — same visual treatment regardless of which page renders it. See [SelectDeckCard](./SelectDeckCard.md) for the CSS details.

**Depends on:** `Card`/`CardContent`/`CardHeader`/`CardTitle`/`Button` from `src/components/ui/`.

**Used by:** [SelectDeckCard](./SelectDeckCard.md), [MyDecksPage](./MyDecksPage.md).

**Tested by:** [docs/tests/DeckGrid.md](../tests/DeckGrid.md).
