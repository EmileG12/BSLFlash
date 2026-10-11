// Shared by SubCategoryChips (single-select) and TagFilterChips
// (multi-select) so the two don't duplicate this styling.
//
// Sits on the brand-tinted `.selection-band` gradient in some callers, so the
// focus ring uses --ring-on-brand (not the app-wide --ring/--brand) to stay
// above the 3:1 WCAG minimum against that backdrop -- --ring measured as low
// as 2.09:1 there.
export const CHIP_BASE_CLASS =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring-on-brand)]'

export const CHIP_SELECTED_CLASS = 'border-brand bg-brand text-brand-contrast'

export const CHIP_UNSELECTED_CLASS =
  'border-border bg-background text-foreground hover:border-brand hover:bg-brand-muted hover:text-brand'
