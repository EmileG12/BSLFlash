# NavBar

**Path:** `src/components/NavBar.tsx`

**Purpose:** Top navigation bar rendered on every authenticated page via [AppLayout](./AppLayout.md). Shows the SignStack long-form logo (`/bsl-long-logo.svg`), a "Home" link, the [CategoryMenu](./CategoryMenu.md) dropdowns for Categories and Vocabulary, "Create Decks"/"My Decks" links, and a "Sign Out" button.

**Props:** None.

**Key behavior:**

- **"Sign Out"** calls [`signOut`](../utils/auth.md), then navigates to `/login` regardless of whether `signOut` succeeded or threw (an empty `catch` before the `finally` — sign-out failures are treated as non-blocking, since the user should end up on the login screen either way; without the explicit `catch`, a thrown error would surface as an unhandled promise rejection after the redirect still happened). Hovering it shows the same drop shadow (`box-shadow: 0 8px 12px var(--shadow-color)`) as the deck-select buttons on [SelectDeckCard](./SelectDeckCard.md), reusing the shared `--shadow-color` token.
- **"Categories" and "Vocabulary"** are two instances of [`CategoryMenu`](./CategoryMenu.md), differing only by their `vocabulary` prop — the same split the two `SelectDeckCard`s use on the [HomePage](./HomePage.md). `CategoryMenu` owns its own hover-dropdown behavior and styling; see its doc for the mechanism.
- **"Create Decks"** (→ [CreateDeckPage](./CreateDeckPage.md), `/create-decks`) and **"My Decks"** (→ [MyDecksPage](./MyDecksPage.md), `/my-decks`) are plain `NavLink`s, not `CategoryMenu` dropdowns — each goes straight to a single page rather than listing further choices, so there's nothing to open a menu over.
- The "Home" link turns to `--brand` color with a 2px brand-colored underline on hover (`.navbar-brand:hover` in `NavBar.css`), matching `CategoryMenu`'s trigger hover styling.

**Depends on:** [auth](../utils/auth.md) (`signOut`), [CategoryMenu](./CategoryMenu.md), `react-router-dom` (`Link`, `useNavigate`).

**Tested by:** [docs/tests/NavBar.md](../tests/NavBar.md) (jsdom) and [docs/tests/NavBar.browser.md](../tests/NavBar.browser.md) (real Chromium) — both render `NavBar` and exercise the `CategoryMenu` dropdowns through it.
