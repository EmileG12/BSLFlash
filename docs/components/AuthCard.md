# AuthCard

**Path:** `src/components/AuthCard.tsx`

**Purpose:** Shared Card scaffold for auth pages — the outer centered page wrapper, the shadcn `Card`, and the `CardHeader` (title + description). Extracted so [LoginPage](./LoginPage.md) and [SignupPage](./SignupPage.md) don't duplicate this markup; each page supplies its own `<form>` (containing `CardContent`/`CardFooter`) as `children`.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Card title (e.g. "Log in", "Sign up"). |
| `description` | `string` | Yes | Subtitle text under the title. |
| `children` | `ReactNode` | Yes | The page's own form content, rendered after the header. |

**Key behavior:** Purely presentational — no state, no logic. `children` renders after `CardHeader` rather than being wrapped by it, since each page's `<form>` needs to contain `CardContent`/`CardFooter`, not `CardHeader` (which has no form controls).

**Used by:** [LoginPage](./LoginPage.md), [SignupPage](./SignupPage.md).
