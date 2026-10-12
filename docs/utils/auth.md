# auth

**Path:** `src/lib/auth.ts`

**Purpose:** Wraps Supabase Auth calls (`signInWithPassword`, `signUp`, `signOut`) so the rest of the app never talks to `supabase.auth` directly. This is also what gives tests a clean mocking boundary — see [docs/tests/](../tests/README.md) — instead of needing a real Supabase instance.

**Exports:**

| Export | Type | Description |
|---|---|---|
| `signInWithPassword` | `(email: string, password: string) => Promise<void>` | Signs in via Supabase Auth. On failure, throws `Error(LOGIN_ERROR_MESSAGE)` if the credentials were wrong (`error.code === 'invalid_credentials'`), or a generic `Error('Something went wrong. Please try again.')` for anything else (network failure, etc.) — the two are deliberately distinguished so a real outage isn't mislabeled as "wrong password." |
| `signUp` | `(email: string, username: string, password: string) => Promise<{ hasSession: boolean }>` | Creates an account via `supabase.auth.signUp()` (real GoTrue signup — password hashing, rate limiting, etc. — not a hand-rolled insert), passing `username` through `options.data` so the [`handle_new_user`](../rpc-functions/handle_new_user.md) trigger can create the matching `profiles`/`user_roles` rows. On failure, throws `Error(SIGNUP_ALREADY_IN_USE_MESSAGE)` for either a duplicate email (GoTrue's own `error.code === 'user_already_exists'`) or a duplicate username (the trigger's `unique_violation`, which GoTrue reports as a generic `error.message === 'Database error saving new user'` with no `error.code` — verified live against the local Auth API; the two cases aren't distinguishable from the client, so they share one honest message rather than pretending otherwise). Any other failure throws a separate generic message. Returns `hasSession` so the caller can navigate correctly whether or not email confirmation is enabled (locally it's disabled, so this is always `true`). |
| `signOut` | `() => Promise<void>` | Signs out via Supabase Auth, then clears the React Query cache ([`queryClient`](./queryClient.md)). The clear matters because several hooks' query keys (e.g. `useCustomDecks`'s `['customDecks']`) don't include the user id — without it, a second user signing in on the same tab would briefly see the previous user's cached data before the next fetch replaces it. Throws the same generic error on failure, without clearing the cache (the user wasn't actually signed out). |
| `LOGIN_ERROR_MESSAGE` | `string` | `'Email or password are incorrect.'` — exported so [LoginPage](../components/LoginPage.md) and its tests reference the same string rather than duplicating it. |
| `MIN_SIGNUP_PASSWORD_LENGTH` | `number` | `8` — matches `supabase/config.toml`'s `minimum_password_length`, kept in sync manually (Supabase has no server-side max-length concept, so the upper bound is enforced client-side only). |
| `MAX_SIGNUP_PASSWORD_LENGTH` | `number` | `64` — client-side only; safely under bcrypt's own 72-byte truncation limit regardless. |
| `SIGNUP_ALREADY_IN_USE_MESSAGE` | `string` | `'Email or username are already in use.'` — shared message for both duplicate-email and duplicate-username signup failures (see `signUp` above for why they can't be distinguished). |

**Used by:** [LoginPage](../components/LoginPage.md) (`signInWithPassword`), [SignupPage](../components/SignupPage.md) (`signUp`, `MIN_SIGNUP_PASSWORD_LENGTH`, `MAX_SIGNUP_PASSWORD_LENGTH`), [NavBar](../components/NavBar.md) (`signOut`).
