# TagFilterChips.test.tsx

**Path:** `src/components/TagFilterChips.test.tsx`
**Tests:** [TagFilterChips](../components/TagFilterChips.md)

## Coverage

- Renders nothing when there are no tags in use.
- Marks selected tags as `aria-pressed` and calls `onToggle` with the tag's id when one is clicked.
- Shows the directory-specific fallback message ("Tags unavailable — showing all decks") on a fetch error.

## Notes

Mocks `../lib/supabase`'s `rpc` directly (the hook `useAvailableDeckTags` calls it under the hood), so the component is tested without a real Supabase call. Renders via [renderWithQueryClient](./renderWithQueryClient.md), since `TagFilterChips` calls [useAvailableDeckTags](../hooks/useAvailableDeckTags.md), which requires a `QueryClientProvider` ancestor. No router needed. The chip markup itself is tested in [TagChipList.test.tsx](./TagChipList.md), since [TagFilterChips](../components/TagFilterChips.md) delegates to it.
