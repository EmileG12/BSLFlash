# LoginPage.test.tsx

**Path:** `src/pages/LoginPage.test.tsx`
**Tests:** [LoginPage](../components/LoginPage.md)

## Coverage

- Shows the generic error message (`Email or password are incorrect.`) when `signInWithPassword` rejects, and does not navigate away.
- Navigates to `/` after a successful login.
- Navigates to `/signup` when the "Sign Up" link is clicked.

## Notes

Mocks `../lib/auth` (`signInWithPassword`, `LOGIN_ERROR_MESSAGE`) via an explicit factory — see [auth](../utils/auth.md) — rather than the Supabase client, so the test doesn't need a running Supabase instance. Navigation is verified by rendering real routes (`MemoryRouter` + `Routes`) and asserting on the resulting screen content, not by mocking `useNavigate`.
