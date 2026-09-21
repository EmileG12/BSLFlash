# NavBar

**Path:** `src/components/NavBar.tsx`

**Purpose:** Top navigation bar rendered on every authenticated page via [AppLayout](./AppLayout.md). Shows the SignStack long-form logo (`/bsl-long-logo.svg`), a "Home" link and two category dropdown menus on the left, and a "Sign Out" button on the right.

**Props:** None.

**Key behavior:**

- **"Sign Out"** calls [`signOut`](../utils/auth.md), then navigates to `/login` regardless of whether `signOut` succeeded or threw (an empty `catch` before the `finally` — sign-out failures are treated as non-blocking, since the user should end up on the login screen either way; without the explicit `catch`, a thrown error would surface as an unhandled promise rejection after the redirect still happened).
- **"Categories" and "Vocabulary" dropdowns** are two instances of the file-local `CategoryMenu` component, differing only by their `vocabulary` prop — the same split the two [SelectDeckCard](./SelectDeckCard.md)s use on the [HomePage](./HomePage.md). Each calls [`useCategories`](../hooks/useCategories.md) with its own `vocabulary` value (`false` = topic categories, `true` = vocabulary-requirement categories) and renders one menu item per category. Selecting one navigates to `/flashcards/:categoryId`, the [ModeSelectPage](./ModeSelectPage.md), matching what clicking a `SelectDeckCard` button does.
- Each trigger renders its label followed by a Lucide `ArrowRight` icon. While the fetch is in flight the menu shows a disabled "Loading..." item; if it resolves with zero rows, a disabled "No categories yet" item.

**Implementation notes:** The dropdowns are built on `src/components/ui/dropdown-menu.tsx`, the shadcn wrapper around Radix's `DropdownMenu` primitive (keyboard navigation, focus management and dismissal come from Radix rather than being hand-rolled). Trigger styling lives in `NavBar.css` (`.navbar-menu-trigger`) so the triggers match the plain-text look of the "Home" link; the menu panel is widened past its default trigger-matched width with a `min-w-48` utility so longer category names don't wrap.

**Depends on:** [auth](../utils/auth.md) (`signOut`), [useCategories](../hooks/useCategories.md), `react-router-dom` (`Link`, `useNavigate`), `lucide-react` (`ArrowRight`), `src/components/ui/dropdown-menu.tsx`.

**Tested by:** [docs/tests/NavBar.md](../tests/NavBar.md) (jsdom) and [docs/tests/NavBar.browser.md](../tests/NavBar.browser.md) (real Chromium).
