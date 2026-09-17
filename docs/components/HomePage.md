# HomePage

**Path:** `src/pages/HomePage.tsx`

**Purpose:** Placeholder landing page at `/` for logged-in users. Built out later — currently just confirms the auth/routing shell works end to end.

**Props:** None.

**Key behavior:** Reads the current session via [`useAuth`](../hooks/useAuth.md) and greets the user by email if available.

**Depends on:** [useAuth](../hooks/useAuth.md).
