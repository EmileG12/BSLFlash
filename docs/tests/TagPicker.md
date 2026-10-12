# TagPicker.test.tsx

**Path:** `src/components/TagPicker.test.tsx`
**Tests:** [TagPicker](../components/TagPicker.md)

## Coverage

- Shows "No tags available yet." when the categories list is empty.
- Offers every category, not only ones already in use as deck tags, and marks the selected ones as pressed.
- Calls `onToggle` with the clicked category's id.

## Notes

Mocks `../lib/supabase`'s `from` via an explicit factory, chaining `select().order()` to return a list of categories. The "offers every category" case uses a two-category list with one selected, so both the selected styling and the toggle callback are exercised against the same render. Renders via [renderWithQueryClient](./renderWithQueryClient.md), since `TagPicker` calls [useAllCategories](../hooks/useAllCategories.md), which requires a `QueryClientProvider` ancestor.
