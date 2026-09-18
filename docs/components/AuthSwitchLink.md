# AuthSwitchLink

**Path:** `src/components/AuthSwitchLink.tsx`

**Purpose:** The small "switch to the other auth page" link shown under the submit button on both [LoginPage](./LoginPage.md) ("Sign Up", to `/signup`) and [SignupPage](./SignupPage.md) ("Log In", to `/login`) — same styling in both places (grey text, smaller than the button, underline only on hover), extracted so that styling isn't duplicated per page.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `to` | `string` | Yes | Route to navigate to, passed straight through to `react-router-dom`'s `Link`. |
| `children` | `string` | Yes | The link text (e.g. `"Sign Up"`, `"Log In"`). |

**Key behavior:** Thin wrapper around `react-router-dom`'s `Link` with a fixed set of classes (`text-muted-foreground cursor-pointer text-center text-xs no-underline hover:underline`) — no logic of its own.

**Used by:** [LoginPage](./LoginPage.md), [SignupPage](./SignupPage.md).
