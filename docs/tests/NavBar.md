# NavBar.test.tsx

**Path:** `src/components/NavBar.test.tsx`
**Tests:** [NavBar](../components/NavBar.md)

## Coverage

- Renders a "Home" link.
- Renders the SignStack logo image (accessible name "SignStack").
- Clicking "Sign Out" calls `signOut` and navigates to `/login`.
- Still navigates to `/login` even if `signOut` rejects (this test caught a real bug: the original `try { await signOut() } finally { navigate(...) }` let the error propagate as an unhandled promise rejection after the `finally` ran — fixed by adding an explicit empty `catch`).

## Notes

Mocks `../lib/auth` (`signOut`) via an explicit factory — see [auth](../utils/auth.md). Navigation is verified by rendering real routes and asserting on the resulting screen content, not by mocking `useNavigate`.
