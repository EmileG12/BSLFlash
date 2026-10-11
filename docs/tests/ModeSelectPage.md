# ModeSelectPage.test.tsx

**Path:** `src/pages/ModeSelectPage.test.tsx`
**Tests:** [ModeSelectPage](../components/ModeSelectPage.md)

## Coverage

- Renders "Practice" and "10 Cards" buttons.
- Clicking "Practice" navigates to `/flashcards/:deckType/:categoryId/practice`.
- Clicking "10 Cards" navigates to `/flashcards/:deckType/:categoryId/ten-cards`.
- Shows an error instead of mode buttons for an unrecognized `deckType`.
- Shows no subcategory section for a non-vocabulary category, or for a custom deck.
- Shows the subcategory section, with "All" pre-selected, for a vocabulary category.
- Navigates without a query string when "All" is selected.
- Appends `?subcategory=<id>` to both mode-tile navigation targets once a subcategory chip is picked.
- Pre-selects the subcategory chip matching a `?subcategory=` already present in the URL.

## Notes

Mocks `../lib/supabase`'s `from` (for [useCategoryInfo](../hooks/useCategoryInfo.md)'s category lookup) and `rpc` (for [SubCategoryChips](../components/SubCategoryChips.md)'s subcategory list) — both the `useCategoryInfo` call and this mocking are new as of this feature; the page previously had a static title with no Supabase query at all. Navigation is tested by rendering real routes (`MemoryRouter`/`Routes`) with stub destination routes and asserting on what ends up on screen, same convention as [SelectDeckCard.test.tsx](./SelectDeckCard.md); the query-string-forwarding cases use a small location-probe component to assert on `location.search` at the destination route.
