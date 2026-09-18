# HomePage

**Path:** `src/pages/HomePage.tsx`

**Purpose:** Landing page at `/` for logged-in users. Greets the user and shows the deck picker.

**Props:** None.

**Key behavior:** Reads the current session via [`useAuth`](../hooks/useAuth.md) and greets the user by email if available. Renders [SelectDeckCard](./SelectDeckCard.md) below the greeting.

**Depends on:** [useAuth](../hooks/useAuth.md), [SelectDeckCard](./SelectDeckCard.md).
