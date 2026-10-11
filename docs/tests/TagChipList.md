# TagChipList.test.tsx

**Path:** `src/components/TagChipList.test.tsx`
**Tests:** [TagChipList](../components/TagChipList.md)

## Coverage

- Renders nothing when there are no tags and no `emptyMessage` is given.
- Shows the `emptyMessage` when given and there are no tags.
- Marks selected tags as `aria-pressed` and calls `onToggle` with the tag's id when one is clicked.
- Shows a loading skeleton while `loading` is true.

## Notes

No Supabase mocking and no router needed: `TagChipList` is purely presentational, driven entirely by props. Uses `userEvent` for the click interaction.
