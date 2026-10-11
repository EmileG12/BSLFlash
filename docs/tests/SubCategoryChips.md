# SubCategoryChips.test.tsx

**Path:** `src/components/SubCategoryChips.test.tsx`
**Tests:** [SubCategoryChips](../components/SubCategoryChips.md)

## Coverage

- "All" is always rendered, and pressed by default, even before the RPC resolves.
- Renders a chip for each subcategory the RPC returns.
- Marks the chip matching `selectedId` as pressed, not "All", when one is selected.
- Clicking a subcategory chip calls `onSelect` with its id.
- Clicking "All" calls `onSelect` with `null`.
- On RPC failure, shows only "All" plus the "Topics unavailable" note, with no subcategory chips.

## Notes

Mocks `../lib/supabase`'s `rpc` via an explicit factory, same style as [useRandomFlashcard.test.ts](./useRandomFlashcard.md). Renders the component directly (no router/page needed).
