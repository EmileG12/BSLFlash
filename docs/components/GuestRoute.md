# GuestRoute

**Path:** `src/components/GuestRoute.tsx`

**Purpose:** Route guard — the inverse of [ProtectedRoute](./ProtectedRoute.md). Blocks access to signed-out-only pages (currently just `/login`) when already authenticated.

**Props:** None (used as a parent `<Route>` element).

**Key behavior:** Reads session state via [`useAuth`](../hooks/useAuth.md). Renders nothing while `loading`. If there's an active session, redirects to `/`. Otherwise renders `<Outlet />`.

**Depends on:** [useAuth](../hooks/useAuth.md), `react-router-dom` (`Navigate`, `Outlet`).
