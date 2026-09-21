# NavBar.test.tsx

**Path:** `src/components/NavBar.test.tsx`
**Tests:** [NavBar](../components/NavBar.md)
**Suite:** `unit` (jsdom) — runs on `npm run test`

## Coverage

- Renders a "Home" link.
- Renders the SignStack logo image (accessible name "SignStack").
- Clicking "Sign Out" calls `signOut` and navigates to `/login`.
- Still navigates to `/login` even if `signOut` rejects (this test caught a real bug: the original `try { await signOut() } finally { navigate(...) }` let the error propagate as an unhandled promise rejection after the `finally` ran — fixed by adding an explicit empty `catch`).
- Renders both the "Categories" and "Vocabulary" menu triggers.
- The Categories menu lists topic categories, and selecting one navigates to `/flashcards/:categoryId`.
- The Vocabulary menu lists vocabulary categories, fetched separately from the Categories menu.
- A menu with zero categories shows a "No categories yet" item.

## Notes

Mocks `../lib/auth` (`signOut`) via an explicit factory — see [auth](../utils/auth.md). Category data comes from the shared [`mockCategories`](./mockCategories.md) helper. Navigation is verified by rendering real routes and asserting on the resulting screen content, not by mocking `useNavigate`.

**Menus are opened by keyboard here, via the file's `openMenu` helper** (focus the trigger, press Enter) rather than by clicking. Opening a Radix menu with a simulated mouse click is not reliable in jsdom: Radix depends on the open menu setting `pointer-events: none` on `<body>`, which in a real browser makes the trigger un-hit-testable so the trailing `click` is never delivered to it. jsdom has no hit-testing, so that click reaches the trigger and toggles the menu straight back shut. Whether it does depends on a `setTimeout(…, 0)` inside Radix's `DismissableLayer` that arms its outside-dismiss listener — which lands after the click in the first test of a file but mid-click in every later one, so the same test passes alone and fails in suite order.

Enter on a focused trigger is a first-class way to open a Radix menu and avoids that machinery entirely. Mouse opening is covered for real in [NavBar.browser.md](./NavBar.browser.md). Clicking a menu *item* still uses a normal `user.click` — only the interaction that opens the layer is affected.
