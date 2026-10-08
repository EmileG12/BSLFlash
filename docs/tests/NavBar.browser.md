# NavBar.browser.test.tsx

**Path:** `src/components/NavBar.browser.test.tsx`
**Tests:** [NavBar](../components/NavBar.md) and, through it, [CategoryMenu](../components/CategoryMenu.md)
**Suite:** `browser` (real Chromium via Playwright) — runs on `npx vitest run --project=browser`, *not* on `npm run test`

## Coverage

- Hovering the "Categories" trigger opens the menu and lists its categories.
- Clicking a category in the open menu navigates to `/flashcards/:deckType/:categoryId`.
- Hovering the "Vocabulary" trigger opens its own menu, independently of the Categories menu.
- Moving the pointer away from the trigger (without entering the menu) closes it.

## Notes

This file exists for one reason: **opening a Radix dropdown by hover cannot be covered in jsdom.** The Categories/Vocabulary menus, [CategoryMenu](../components/CategoryMenu.md), open on real mouse hover rather than click (the trigger's own pointerdown-to-toggle is deliberately suppressed so clicks can't fight with the hover-driven open state), and hover depends on real pointer movement and hit-testing, which jsdom doesn't do. See [CategoryMenu.md](../components/CategoryMenu.md) for the full mechanism and why the jsdom tests open menus by keyboard instead.

`userEvent` is imported from **`vitest/browser`**, which is Playwright's real input driver — it moves an actual cursor and does real hit-testing. This is the load-bearing detail: `@testing-library/user-event` dispatches synthetic events at an element you name, so using it here would reproduce the jsdom behavior inside Chromium and the file would prove nothing. (In Vitest 5 the import path is the virtual module `vitest/browser`; `@vitest/browser/context` is a legacy shim that throws.)

Everything cheaper to cover in jsdom — which categories are fetched, menu contents, navigation wiring, loading and empty states — stays in [NavBar.md](./NavBar.md) so it's checked on every change. Keep this file to behavior that genuinely needs a browser.

Module mocks (`../lib/auth`, `../lib/supabase`) work the same as in jsdom tests; category data comes from the shared [`mockCategories`](./mockCategories.md) helper.
