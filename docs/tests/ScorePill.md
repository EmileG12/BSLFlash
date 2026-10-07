# ScorePill.test.tsx

**Path:** `src/components/ScorePill.test.tsx`
**Tests:** [ScorePill](../components/ScorePill.md)

## Coverage

- Renders a `Score:`/number group when no `round` prop is given.
- Renders a `Round:`/number group, a divider, and a `Score:`/number group when `round` is given.

## Notes

No Supabase mocking — `ScorePill` is a pure presentational component with no data fetching. Since the pill's numeral(s) render in their own nested `<span>` (styled separately from the labels), the test reads the badge's full text via `container.querySelector('.flashcard-score-badge')?.textContent`, normalizing whitespace, rather than `getByText` (which can't match text split across multiple elements). The same helper pattern is used in [FlashcardPage.test.tsx](./FlashcardPage.md) and [TenCardsPage.test.tsx](./TenCardsPage.md) to check the pill as rendered through those pages.
