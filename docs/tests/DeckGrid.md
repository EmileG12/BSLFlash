# DeckGrid.test.tsx

**Path:** `src/components/DeckGrid.test.tsx`
**Tests:** [DeckGrid](../components/DeckGrid.md)

## Coverage

- Shows a loading state.
- Shows an error message.
- Shows the given `emptyMessage` when `items` is empty.
- Renders a button per item and calls `onSelect` with its `id` when clicked.

## Notes

No Supabase mocking and no router needed — `DeckGrid` is purely presentational, driven entirely by props. Uses `userEvent` for the click interaction.
