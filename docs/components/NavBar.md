# NavBar

**Path:** `src/components/NavBar.tsx`

**Purpose:** Top navigation bar rendered on every authenticated page via [AppLayout](./AppLayout.md). Shows the SignStack long-form logo (`/bsl-long-logo.svg`) and a "Home" link on the left, and a "Sign Out" button on the right.

**Props:** None.

**Key behavior:** "Sign Out" calls [`signOut`](../utils/auth.md), then navigates to `/login` regardless of whether `signOut` succeeded or threw (an empty `catch` before the `finally` — sign-out failures are treated as non-blocking, since the user should end up on the login screen either way; without the explicit `catch`, a thrown error would surface as an unhandled promise rejection after the redirect still happened).

**Depends on:** [auth](../utils/auth.md) (`signOut`), `react-router-dom` (`Link`, `useNavigate`).

**Tested by:** [docs/tests/NavBar.md](../tests/NavBar.md).
