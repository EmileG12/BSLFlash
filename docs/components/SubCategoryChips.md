# SubCategoryChips

**Path:** `src/components/SubCategoryChips.tsx`

**Purpose:** Lets the user narrow a vocabulary category's word pool down to one topic subcategory (e.g. narrowing GCSE to just its Colours words), or back to "All". Rendered by [ModeSelectPage](./ModeSelectPage.md), and only when the current category `isVocabulary` (see [useCategoryInfo](../hooks/useCategoryInfo.md)) — a topic category or a custom deck has no subcategories to narrow by.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `categoryId` | `string` | The vocabulary category to fetch subcategory choices for. |
| `selectedId` | `string \| null` | The currently selected subcategory id, or `null` for "All". |
| `onSelect` | `(id: string \| null) => void` | Called with the clicked chip's id, or `null` when "All" is clicked. |

**Key behavior:** On mount and whenever `categoryId` changes, calls the [`get_available_subcategories_for_category`](../rpc-functions/get_available_subcategories_for_category.md) RPC, which only ever returns topic categories that share at least one word with `categoryId` — so a subcategory that would produce zero words never appears as a choice at all, rather than being shown and then turning up empty once picked.

Renders as a `role="group"` of `<button aria-pressed>` pills (`CHIP_SELECTED_CLASS`/`CHIP_UNSELECTED_CLASS`) rather than shadcn's `ToggleGroup` — matches `ModeTile`, the hand-rolled button directly below it on [ModeSelectPage](./ModeSelectPage.md), keeping the page internally consistent rather than mixing primitive styles. The "All" chip is always rendered (even mid-fetch, as `aria-pressed="true"` when `selectedId` is `null`), so the control never flashes empty while loading.

Chips sit directly on the `.selection-band` gradient in [ModeSelectPage](./ModeSelectPage.md)'s `CardHeader`, not on a plain `--background`/`--muted` surface, which is why the focus ring below uses its own token. The `focus-visible` outline is `outline-[var(--ring-on-brand)]` rather than the app-wide `--ring`: the `--ring` outline measured as low as 2.09:1 against the gradient's more brand-tinted end, below the WCAG 1.4.11 3:1 minimum for focus indicators, while `--ring-on-brand` measures 16–21:1 in light mode and 12–19:1 in dark mode. `--ring-on-brand` is defined in `src/index.css` as `var(--foreground)` in both `:root` and `.dark`, mapped to `--color-ring-on-brand` in `@theme inline` — reusing `--foreground` (already the established high-contrast neutral text color in each theme, near-black in light mode / near-white in dark) rather than introducing a new raw color value. It is scoped to this component's focus ring: components on plain `--background` (e.g. the `.mode-tile` focus ring in `ModeSelectPage.css`) keep `--ring`.

Selected chips use `CHIP_SELECTED_CLASS` (`bg-brand text-brand-contrast`). `--brand-contrast` is `oklch(1 0 0)` (literal white) in both `:root` and `.dark`, mapped to `--color-brand-contrast` in `@theme inline`. It is a separate token from `--brand-foreground` (which is a muted gold, not white) rather than a changed value for that token, because `--brand-foreground` is also used elsewhere (e.g. `.mode-tile-icon`'s hover state) where its existing gold value is correct — changing it would have fixed this chip's contrast at the cost of breaking that unrelated usage.

While loading, shows 4 skeleton pills (`motion-safe:animate-pulse`, `aria-hidden="true"`) beside the always-present "All" chip, plus a `sr-only` "Loading topics…" announcement. On RPC failure, shows only "All" plus a muted note ("Topics unavailable — showing all signs") — an empty result (a category with no available subcategories) shows the same "All"-only chip row, but silently, with no note, since that's a valid state rather than a failure.

**Depends on:** `cn` (class merging), `supabase` client, the [`get_available_subcategories_for_category`](../rpc-functions/get_available_subcategories_for_category.md) RPC.

**Used by:** [ModeSelectPage](./ModeSelectPage.md).

**Tested by:** [docs/tests/SubCategoryChips.md](../tests/SubCategoryChips.md).
