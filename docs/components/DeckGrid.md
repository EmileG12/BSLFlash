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
| `onDelete` | `(item: DeckGridItem) => void` (optional) | When given, each item also renders a trailing delete icon button — a sibling `Button` next to the select button, not nested inside it (buttons can't nest). Omit for a read-only list like `SelectDeckCard`'s. |

**Key behavior:** Renders one of: a loading message, an error message, an empty-state message, or a responsive grid of buttons (one per item, `variant="outline"`), inside a `Card`/`CardHeader`/`CardContent`. Has no data-fetching, navigation, or delete logic of its own — all three are the caller's job (`SelectDeckCard` passes `useCategories`-derived items and navigates via `onSelect`, no `onDelete`; `MyDecksPage` passes `useCustomCategories`-derived items and an `onDelete` that opens its confirmation dialog). This single component is MyDecksPage's entire deck list — it used to be paired with a second, separate `<ul>` just for delete buttons, duplicating every deck name on the page; `onDelete` replaced that with one list serving both actions.

**Layout:** Reuses `src/components/SelectDeckCard.css`'s classes (`select-deck-card`/`select-deck-grid`/`select-deck-button`) rather than a new stylesheet — same visual treatment regardless of which page renders it. See [SelectDeckCard](./SelectDeckCard.md) for the CSS details.

**Depends on:** `Card`/`CardContent`/`CardHeader`/`CardTitle`/`Button` from `src/components/ui/`.

**Used by:** [SelectDeckCard](./SelectDeckCard.md), [MyDecksPage](./MyDecksPage.md).

**Tested by:** [docs/tests/DeckGrid.md](../tests/DeckGrid.md).
