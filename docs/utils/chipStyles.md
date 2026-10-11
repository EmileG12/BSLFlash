# chipStyles

**Path:** `src/lib/chipStyles.ts`

**Purpose:** Shared Tailwind class strings for pill-shaped toggle chips. Extracted from [SubCategoryChips](../components/SubCategoryChips.md)' inline constants so that [SubCategoryChips](../components/SubCategoryChips.md) (single-select) and [TagChipList](../components/TagChipList.md) (multi-select, behind [TagFilterChips](../components/TagFilterChips.md) and [TagPicker](../components/TagPicker.md)) render the same look without duplicating it. The two components keep their own behaviour and markup; only the styling is shared.

**Exports:**

| Export | Value (summary) |
|---|---|
| `CHIP_BASE_CLASS` | Inline-flex pill with border, padding, `text-sm font-medium`, transition, and a `focus-visible` outline using `--ring-on-brand`. |
| `CHIP_SELECTED_CLASS` | `border-brand bg-brand text-brand-contrast`. |
| `CHIP_UNSELECTED_CLASS` | `border-border bg-background text-foreground`, with brand-tinted hover. |

Callers combine them with `cn(CHIP_BASE_CLASS, selected ? CHIP_SELECTED_CLASS : CHIP_UNSELECTED_CLASS)`.

**Key behavior:** The focus ring uses `--ring-on-brand` instead of the app-wide `--ring`. The chips sit on the brand-tinted `.selection-band` gradient in some callers, and `--ring` measured as low as 2.09:1 against that backdrop, below the WCAG 3:1 minimum for focus indicators. The source comment records this measurement.

**Used by:** [SubCategoryChips](../components/SubCategoryChips.md), [TagChipList](../components/TagChipList.md).
