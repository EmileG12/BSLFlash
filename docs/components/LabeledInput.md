# LabeledInput

**Path:** `src/components/LabeledInput.tsx`

**Purpose:** A `<label>` + shadcn `Input` pair with the vertical layout [LoginPage](./LoginPage.md) and [SignupPage](./SignupPage.md) both repeat for every field (email, username, password, confirm password). Extracted so that markup isn't duplicated per field, within or across pages.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `label` | `string` | Yes | Text shown in the `<label>`. |
| ...rest | `ComponentProps<typeof Input>` | — | Every prop `Input` itself accepts (`id`, `type`, `value`, `onChange`, `autoComplete`, `required`, etc.) — forwarded straight through. `id` is also used to link the `<label htmlFor>` to the `<input id>` for accessibility. |

**Key behavior:** Destructures `label` and `id` for its own use, spreads everything else (`...props`) onto the underlying `Input` untouched — so it behaves exactly like `Input` itself, plus a label.

**Used by:** [LoginPage](./LoginPage.md), [SignupPage](./SignupPage.md).
