# ModeSelectPage.test.tsx

**Path:** `src/pages/ModeSelectPage.test.tsx`
**Tests:** [ModeSelectPage](../components/ModeSelectPage.md)

## Coverage

- Renders "Practice" and "10 Cards" buttons.
- Clicking "Practice" navigates to `/flashcards/:categoryId/practice`.
- Clicking "10 Cards" navigates to `/flashcards/:categoryId/ten-cards`.

## Notes

No Supabase mocking needed — the page does no data fetching of its own. Navigation is tested by rendering real routes (`MemoryRouter`/`Routes`) with stub destination routes and asserting on what ends up on screen, same convention as [SelectDeckCard.test.tsx](./SelectDeckCard.md).
