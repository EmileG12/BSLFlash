# useAuth

**Path:** `src/hooks/useAuth.ts`
**Signature:** `useAuth(): { session: Session | null; loading: boolean }`

**Purpose:** Tracks the current Supabase Auth session reactively, so components can render based on whether the user is logged in without each one re-implementing session lookup.

**Behavior:** On mount, calls `supabase.auth.getSession()` once to get the current session and flips `loading` to `false`. Also subscribes to `supabase.auth.onAuthStateChange`, which fires whenever the session changes (login, logout, token refresh) and updates `session` accordingly — this is what makes [ProtectedRoute](../components/ProtectedRoute.md)/[GuestRoute](../components/GuestRoute.md) redirect immediately after sign-in/sign-out rather than only on next page load. The subscription is cleaned up on unmount.

**Used by:** [ProtectedRoute](../components/ProtectedRoute.md), [GuestRoute](../components/GuestRoute.md), [HomePage](../components/HomePage.md).
