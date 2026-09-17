# auth

**Path:** `src/lib/auth.ts`

**Purpose:** Wraps Supabase Auth calls (`signInWithPassword`, `signOut`) so the rest of the app never talks to `supabase.auth` directly. This is also what gives tests a clean mocking boundary — see [docs/tests/](../tests/README.md) — instead of needing a real Supabase instance.

**Exports:**

| Export | Type | Description |
|---|---|---|
| `signInWithPassword` | `(email: string, password: string) => Promise<void>` | Signs in via Supabase Auth. On failure, throws `Error(LOGIN_ERROR_MESSAGE)` if the credentials were wrong (`error.code === 'invalid_credentials'`), or a generic `Error('Something went wrong. Please try again.')` for anything else (network failure, etc.) — the two are deliberately distinguished so a real outage isn't mislabeled as "wrong password." |
| `signOut` | `() => Promise<void>` | Signs out via Supabase Auth. Throws the same generic error on failure. |
| `LOGIN_ERROR_MESSAGE` | `string` | `'Email or password are incorrect.'` — exported so [LoginPage](../components/LoginPage.md) and its tests reference the same string rather than duplicating it. |

**Used by:** [LoginPage](../components/LoginPage.md) (`signInWithPassword`), [NavBar](../components/NavBar.md) (`signOut`).
