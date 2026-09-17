# ProtectedRoute

**Path:** `src/components/ProtectedRoute.tsx`

**Purpose:** Route guard — blocks access to authenticated pages when signed out.

**Props:** None (used as a parent `<Route>` element; wraps child routes via react-router's nested-route outlet mechanism).

**Key behavior:** Reads session state via [`useAuth`](../hooks/useAuth.md). Renders nothing while `loading` (avoids a flash of the login page before the initial session check resolves). If there's no session, redirects to `/login`. Otherwise renders `<Outlet />` so the actual matched child route (wrapped in [AppLayout](./AppLayout.md)) renders.

**Depends on:** [useAuth](../hooks/useAuth.md), `react-router-dom` (`Navigate`, `Outlet`).
