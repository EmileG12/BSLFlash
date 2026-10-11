# DeckGrid.test.tsx

**Path:** `src/components/DeckGrid.test.tsx`
**Tests:** [DeckGrid](../components/DeckGrid.md)

## Coverage

- Shows a loading state.
- Shows an error message.
- Shows the given `emptyMessage` when `items` is empty.
- Renders a button per item and calls `onSelect` with its `id` when clicked.
- Omits the delete button when `onDelete` is not given.
- Renders a delete button per item and calls `onDelete` with the item when given.
- Renders an edit button per item and calls `onEdit` with the item when given.
- Omits the edit button when `onEdit` is not given.
- Uses `deleteActionLabel` for the delete button's `aria-label` when given (`"Remove Animals"`).

## Notes

No Supabase mocking and no router needed — `DeckGrid` is purely presentational, driven entirely by props. Uses `userEvent` for the click interaction.
