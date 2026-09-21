# HomePage

**Path:** `src/pages/HomePage.tsx`

**Purpose:** Landing page at `/` for logged-in users. Greets the user and shows two deck pickers.

**Props:** None.

**Key behavior:** Reads the current session via [`useAuth`](../hooks/useAuth.md) and greets the user by email if available. Renders two [SelectDeckCard](./SelectDeckCard.md)s below the greeting: `vocabulary={false}` (topic categories) on top, then `vocabulary={true}` (titled "Select a vocabulary list") below it.

**Depends on:** [useAuth](../hooks/useAuth.md), [SelectDeckCard](./SelectDeckCard.md).
