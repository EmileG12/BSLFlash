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
- A plain user sees no "Admin" entry.
- An admin-only user sees a plain "Admin" link to `/admin`.
- A superadmin expands the "Admin" disclosure to reveal all five destinations: Add & tag words, Manage categories, Manage words, Manage roles, Manage accounts.
- No "Install App" row appears when [useInstallPrompt](../hooks/useInstallPrompt.md)'s `canInstall` is `false`.
- With `canInstall: true` and `canPromptNatively: true`, tapping "Install App" calls `promptInstall()` and closes the sheet (no dialog opens).
- With `canInstall: true` and `canPromptNatively: false`, tapping "Install App" opens the manual instructions instead of closing the sheet.

## Notes

Category data comes from the shared [`mockCategories`](./mockCategories.md) helper, same as [NavBar.md](./NavBar.md). Mocks `../hooks/useUserRoles` in a `beforeEach` (defaulting to no roles), because [MobileNavSheet](../components/MobileNavSheet.md) renders its admin entry unconditionally and would otherwise crash on an undefined roles result. See [useUserRoles](../hooks/useUserRoles.md). Also mocks `../hooks/useInstallPrompt` in the same `beforeEach` (defaulting to `canInstall: false`), so the existing nav-link assertions aren't affected by the new row; individual tests override it with `mockReturnValue` to exercise the install row's two tap paths. Unlike `CategoryMenu`'s desktop hover-dropdown, the Categories/Vocabulary disclosures here open on a plain click (no hover simulation needed, so no browser-suite counterpart is required for this file). Renders via [renderWithQueryClient](./renderWithQueryClient.md), since the sheet calls [useCategories](../hooks/useCategories.md), which requires a `QueryClientProvider` ancestor.
