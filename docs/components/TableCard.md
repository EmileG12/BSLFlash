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

The band's background is the `.admin-toolbar` class, defined in `src/components/TableCard.css`: a `linear-gradient` at 100deg from `--background` at 0% to `color-mix(in oklab, var(--admin) 12%, var(--background))` at 100%. It reuses the technique of `.selection-band` in `src/components/SelectDeckCard.css` at a shallower angle and a lower mix (that one is 150deg and 30%). A toolbar is a short, wide strip, so it takes a quieter, more horizontal wash that does not compete with the table below.

Because the toolbar is no longer a flat fill, the search `Input` in each toolbar carries `bg-card dark:bg-card`. Without it, the `Input` primitive's transparent default would let the gradient show through and the field would blend into the band instead of reading as a control.

Children are rendered with no padding, so a `Table` runs to the card's edges. Loading, error and empty messages are passed as children too, and pages style them with their own `px-4 py-6` padding, so they stay inside the card.

**Row striping:** every `TableRow` in `src/components/ui/table.tsx` carries `odd:bg-card even:bg-admin-muted`, so the tables inside a `TableCard` alternate between `bg-card` and the `--admin-muted` tint. The striping lives in the shared row rather than in each page because no admin page overrides the row background. The `hover:`, `has-aria-expanded:` and `data-[state=selected]:` modifiers come after the stripe in the class list and still win on interaction. `--admin-muted` is its own token because `brand-muted` is a fixed near-white in both themes, which suits small badge chips but not a full-row fill in dark mode. `--admin-muted` (defined in `src/index.css`, mapped to `bg-admin-muted` through `@theme inline`) follows each theme's neutral scale, so it reads as a faint tint in light mode and a step lighter than the card in dark mode.

**Why not `Card`:** [`Card`](../../src/components/ui/card.tsx) adds vertical padding (`py-(--card-spacing)`) that does not suit a table sitting flush against the container's edges. `TableCard` reuses the same `bg-card` and `ring-foreground/10` tokens rather than overloading `Card` with a no-padding mode.

**Per-page convention, not part of this component:** each page gives its `TableHeader` `bg-muted/40`, which echoes the `TableFooter` styling in `src/components/ui/table.tsx` so the header and footer convention match. Pages set this themselves. Because the header's `TableRow` is the first row in the `thead`, the row stripe's `odd:bg-card` would otherwise paint over that background — `TableHeader` carries `[&_tr]:bg-transparent!` to force its own row transparent so `bg-muted/40` still shows.

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
