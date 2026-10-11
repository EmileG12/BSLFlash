# TableCard

**Path:** `src/components/TableCard.tsx`

**Purpose:** The panel wrapper for admin data tables. It gives a page's table one shared container (rounded, ringed, shadowed, `bg-card`), with an optional toolbar band above the table inside that same container. It is a flush, no-padding variant of the same visual family as the shadcn `Card`, so it sits edge to edge against the table.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `toolbar` | `ReactNode` | Optional content for a header band above `children` (a heading, a search input, an action button). When omitted, no band is rendered. |
| `children` | `ReactNode` | The body: a `Table`, or a loading/error/empty message. |
| `className` | `string` | Extra classes, merged onto the outer container with `cn`. |

**Key behavior:** The outer `div` carries the card styling (`overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 shadow-[0_8px_12px_var(--shadow-color)]`). When `toolbar` is given, it renders in a band with a bottom hairline (`border-b border-border`), laid out in a column on narrow screens and a row with space between from `sm` up. The band and the table share one shell, one ring and one shadow, separated only by that hairline. This is deliberate: a toolbar in its own card stacked above the table reads as two cards.

Children are rendered with no padding, so a `Table` runs to the card's edges. Loading, error and empty messages are passed as children too, and pages style them with their own `px-4 py-6` padding, so they stay inside the card.

**Why not `Card`:** [`Card`](../../src/components/ui/card.tsx) adds vertical padding (`py-(--card-spacing)`) that does not suit a table sitting flush against the container's edges. `TableCard` reuses the same `bg-card` and `ring-foreground/10` tokens rather than overloading `Card` with a no-padding mode.

**Per-page convention, not part of this component:** each page gives its `TableHeader` `bg-muted/40`, which echoes the `TableFooter` styling in `src/components/ui/table.tsx` so the header and footer convention match. Pages set this themselves.

**Page-level messages sit outside the card.** Errors from actions (grant, unban, primary toggle and similar) are rendered above the `TableCard`, not in its toolbar or body.

**Depends on:** `cn` from the `cn` package (class merging, as in `src/components/ui/`). Pure presentational, no hooks and no data.

**Used by:**
- [AdminPage](./AdminPage.md): toolbar with an "Edit word categories" heading and a search input.
- [SuperadminRolesPage](./SuperadminRolesPage.md): toolbar with a search input only.
- [SuperadminAccountsPage](./SuperadminAccountsPage.md): toolbar with a search input only.
- [SuperadminWordsPage](./SuperadminWordsPage.md): toolbar with a search input only.
- [SuperadminWordEditPage](./SuperadminWordEditPage.md): toolbar with a "Variants" heading and an "Add variant" button.
- [SuperadminCategoriesPage](./SuperadminCategoriesPage.md): no toolbar; the table is the only content.

Tested in [TableCard.test.tsx](../tests/TableCard.md).
