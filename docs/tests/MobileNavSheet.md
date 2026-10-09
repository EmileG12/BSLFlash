# MobileNavSheet.test.tsx

**Path:** `src/components/MobileNavSheet.test.tsx`
**Tests:** [MobileNavSheet](../components/MobileNavSheet.md)
**Suite:** `unit` (jsdom) — runs on `npm run test`

## Coverage

- Clicking the hamburger ("Open menu") button opens the sheet, exposing the "Home", "Create Decks", and "My Decks" links.
- Clicking the "Categories" disclosure toggles `aria-expanded` and reveals its categories as links; clicking one navigates to `/flashcards/:deckType/:categoryId`.
- A disclosure with no categories shows a "No categories yet" item.
- Clicking "Sign Out" calls the `onSignOut` prop.
- Clicking any link closes the sheet (the dialog unmounts).

## Notes

Category data comes from the shared [`mockCategories`](./mockCategories.md) helper, same as [NavBar.md](./NavBar.md). Unlike `CategoryMenu`'s desktop hover-dropdown, the Categories/Vocabulary disclosures here open on a plain click (no hover simulation needed, so no browser-suite counterpart is required for this file).
