# NavBar.browser.test.tsx

**Path:** `src/components/NavBar.browser.test.tsx`
**Tests:** [NavBar](../components/NavBar.md) and, through it, [CategoryMenu](../components/CategoryMenu.md) and the superadmin Admin dropdown
**Suite:** `browser` (real Chromium via Playwright) — runs on `npx vitest run --project=browser`, *not* on `npm run test`

## Coverage

- Hovering the "Categories" trigger opens the menu and lists its categories.
- Clicking a category in the open menu navigates to `/flashcards/:deckType/:categoryId`.
- Hovering the "Vocabulary" trigger opens its own menu, independently of the Categories menu.
- Moving the pointer away from the trigger (without entering the menu) closes it.
- Hovering the "Admin" trigger opens the Admin menu for a superadmin.

## Notes

This file exists for one reason: **opening a Radix dropdown by hover cannot be covered in jsdom.** The Categories/Vocabulary menus, [CategoryMenu](../components/CategoryMenu.md), and the superadmin Admin dropdown in [NavBar](../components/NavBar.md) open on real mouse hover rather than click, via [useHoverDropdownMenu](../hooks/useHoverDropdownMenu.md) (which suppresses the trigger's pointerdown-to-toggle so clicks can't fight with the hover-driven open state). Hover depends on real pointer movement and hit-testing, which jsdom doesn't do. See [CategoryMenu.md](../components/CategoryMenu.md) for the component-level mechanism and why the jsdom tests open menus by keyboard instead.

`userEvent` is imported from **`vitest/browser`**, which is Playwright's real input driver — it moves an actual cursor and does real hit-testing. This is the load-bearing detail: `@testing-library/user-event` dispatches synthetic events at an element you name, so using it here would reproduce the jsdom behavior inside Chromium and the file would prove nothing. (In Vitest 5 the import path is the virtual module `vitest/browser`; `@vitest/browser/context` is a legacy shim that throws.)

Everything cheaper to cover in jsdom — which categories are fetched, menu contents, navigation wiring, loading and empty states — stays in [NavBar.md](./NavBar.md) so it's checked on every change. Keep this file to behavior that genuinely needs a browser.

Module mocks (`../lib/auth`, `../lib/supabase`) work the same as in jsdom tests; category data comes from the shared [`mockCategories`](./mockCategories.md) helper. `../hooks/useUserRoles` is also mocked (no roles by default) because [NavBar](../components/NavBar.md) renders its admin entry unconditionally and would otherwise crash on an undefined roles result. Renders via [renderWithQueryClient](./renderWithQueryClient.md), since the category menus call [useCategories](../hooks/useCategories.md), which requires a `QueryClientProvider` ancestor.
