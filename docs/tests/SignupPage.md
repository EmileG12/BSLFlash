# SignupPage.test.tsx

**Path:** `src/pages/SignupPage.test.tsx`
**Tests:** [SignupPage](../components/SignupPage.md)

## Coverage

- Mismatched password/confirm-password shows "Passwords do not match." and does not call `signUp`.
- Password shorter than 8 characters or longer than 64 both show the length error and do not call `signUp`.
- Successful signup with an active session (`hasSession: true`) navigates to `/`.
- Successful signup without a session (`hasSession: false`) navigates to `/login`.
- `signUp` rejecting with `SIGNUP_ALREADY_IN_USE_MESSAGE` shows it via `role="alert"`.
- Any other rejection shows the generic unexpected-error message.
- Navigates to `/login` when the "Log In" link is clicked.

## Notes

Mocks `../lib/auth` (`signUp`, `MIN_SIGNUP_PASSWORD_LENGTH`, `MAX_SIGNUP_PASSWORD_LENGTH`, `SIGNUP_ALREADY_IN_USE_MESSAGE`) via an explicit factory — see [auth](../utils/auth.md) — rather than the Supabase client. Navigation is verified by rendering real routes and asserting on the resulting screen content, not by mocking `useNavigate`.
