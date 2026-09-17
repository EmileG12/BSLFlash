# LoginPage

**Path:** `src/pages/LoginPage.tsx`

**Purpose:** Email/password login form. The only route reachable while signed out (see [GuestRoute](./GuestRoute.md)).

**Props:** None — rendered directly on the `/login` route.

**Key behavior:** Controlled `email`/`password` inputs; on submit, calls [`signInWithPassword`](../utils/auth.md). On success, navigates to `/`. On failure, displays the thrown error's message in a `role="alert"` element — for invalid credentials this is always the generic `Email or password are incorrect.` (never anything that would reveal whether the email or the password was the problem). Submit button is disabled and reads "Logging in…" while a request is in flight.

**Depends on:** [auth](../utils/auth.md) (`signInWithPassword`), `react-router-dom` (`useNavigate`).

**Tested by:** [docs/tests/LoginPage.md](../tests/LoginPage.md).
