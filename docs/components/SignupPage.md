# SignupPage

**Path:** `src/pages/SignupPage.tsx`

**Purpose:** Account creation form (email, username, password, confirm password). Reachable only while signed out (see [GuestRoute](./GuestRoute.md)), linked from [LoginPage](./LoginPage.md)'s "Sign Up" link.

**Props:** None — rendered directly on the `/signup` route.

**Key behavior:** Client-side checks run before any network call, in order: password/confirm-password mismatch → password length (must be [`MIN_SIGNUP_PASSWORD_LENGTH`](../utils/auth.md)–[`MAX_SIGNUP_PASSWORD_LENGTH`](../utils/auth.md), i.e. 8–64 characters). Only if both pass does it call [`signUp`](../utils/auth.md). On success, navigates to `/` if `signUp` returned an active session, or `/login` if not (locally, email confirmation is disabled so this is always `/`; the check exists so this stays correct if confirmations are ever turned on). On failure, displays the thrown error's message via `role="alert"` — for an already-used email or username, this is always the generic [`SIGNUP_ALREADY_IN_USE_MESSAGE`](../utils/auth.md) (the two cases aren't distinguishable from the client — see that doc for why).

**Depends on:** [AuthCard](./AuthCard.md), [LabeledInput](./LabeledInput.md), [auth](../utils/auth.md) (`signUp`, `MIN_SIGNUP_PASSWORD_LENGTH`, `MAX_SIGNUP_PASSWORD_LENGTH`), `react-router-dom` (`useNavigate`).

**Tested by:** [docs/tests/SignupPage.md](../tests/SignupPage.md).
