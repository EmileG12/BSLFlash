# NavBar.test.tsx

**Path:** `src/components/NavBar.test.tsx`
**Tests:** [NavBar](../components/NavBar.md) and, through it, [CategoryMenu](../components/CategoryMenu.md)
**Suite:** `unit` (jsdom) — runs on `npm run test`

## Coverage

- Renders a "Home" link.
- Renders the SignStack logo image (accessible name "SignStack").
- Clicking "Sign Out" calls `signOut` and navigates to `/login`.
- Still navigates to `/login` even if `signOut` rejects (this test caught a real bug: the original `try { await signOut() } finally { navigate(...) }` let the error propagate as an unhandled promise rejection after the `finally` ran — fixed by adding an explicit empty `catch`).
- Renders both the "Categories" and "Vocabulary" menu triggers.
- The Categories menu lists topic categories, and selecting one navigates to `/flashcards/:deckType/:categoryId`.
- The Vocabulary menu lists vocabulary categories, fetched separately from the Categories menu.
- A menu with zero categories shows a "No categories yet" item.
- A plain user sees no "Admin" entry.
- An admin-only user sees a plain "Admin" link to `/admin`, not a dropdown.
- A superadmin sees an "Admin" dropdown with all five destinations: Add & tag words, Manage categories, Manage words, Manage roles, Manage accounts.

## Notes

Mocks `../lib/auth` (`signOut`) via an explicit factory — see [auth](../utils/auth.md). Mocks `../hooks/useUserRoles` in a `beforeEach` (defaulting to no roles), because [NavBar](../components/NavBar.md) renders its admin entry unconditionally and would otherwise read from an undefined roles result. The admin cases override that default per test. See [useUserRoles](../hooks/useUserRoles.md). Category data comes from the shared [`mockCategories`](./mockCategories.md) helper. Navigation is verified by rendering real routes and asserting on the resulting screen content, not by mocking `useNavigate`. Renders via [renderWithQueryClient](./renderWithQueryClient.md), since the category menus call [useCategories](../hooks/useCategories.md), which requires a `QueryClientProvider` ancestor.

**Menus are opened by keyboard here, via the file's `openMenu` helper** (focus the trigger, press Enter) rather than by hovering or clicking. The Categories/Vocabulary menus, [CategoryMenu](../components/CategoryMenu.md), open on real mouse hover, and hovering can't be simulated meaningfully in jsdom — there's no real layout or hit-testing, so a synthetic `mouseenter` doesn't reproduce what a real cursor crossing the trigger's bounds does. The trigger also has its own click-to-toggle suppressed (`onPointerDown` calling `preventDefault`) precisely so clicks don't fight with the hover-driven open state, which rules out simulating a click here too.

Enter on a focused trigger is a separate code path (Radix's `onKeyDown` handler, untouched by the pointerdown suppression) and is a first-class way to open a Radix menu for keyboard users, so it works the same in jsdom as in a real browser. Real hover opening is covered in [NavBar.browser.md](./NavBar.browser.md). Clicking a menu *item* still uses a normal `user.click` — only the interaction that opens the menu is affected.
