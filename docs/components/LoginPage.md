# LoginPage

**Path:** `src/pages/LoginPage.tsx`

**Purpose:** Email/password login form. The only route (besides `/signup`) reachable while signed out (see [GuestRoute](./GuestRoute.md)).

**Props:** None — rendered directly on the `/login` route.

**Key behavior:** Composed from [AuthCard](./AuthCard.md) (Card scaffold) and [LabeledInput](./LabeledInput.md) (each field), rather than its own copy of that markup — see those docs. Controlled `email`/`password` inputs; on submit, calls [`signInWithPassword`](../utils/auth.md). On success, navigates to `/`. On failure, displays the thrown error's message in a `role="alert"` element — for invalid credentials this is always the generic `Email or password are incorrect.` (never anything that would reveal whether the email or the password was the problem). Submit button is disabled and reads "Logging in…" while a request is in flight. Below the submit button, a "Sign Up" link (smaller, grey, underlines only on hover) navigates to [SignupPage](./SignupPage.md) at `/signup`.

**Depends on:** [AuthCard](./AuthCard.md), [LabeledInput](./LabeledInput.md), [auth](../utils/auth.md) (`signInWithPassword`), `react-router-dom` (`useNavigate`, `Link`).

**Tested by:** [docs/tests/LoginPage.md](../tests/LoginPage.md).
