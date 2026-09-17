# AppLayout

**Path:** `src/components/AppLayout.tsx`

**Purpose:** Layout wrapper for all authenticated pages — renders [NavBar](./NavBar.md) once, above whichever page is currently routed.

**Props:** None.

**Key behavior:** Renders `<NavBar />` followed by `<Outlet />` (react-router's placeholder for whatever nested route matched). Used as the parent element of the protected route tree in `src/App.tsx`, so every page under it gets the nav bar without repeating it per page.

**Depends on:** [NavBar](./NavBar.md), `react-router-dom` (`Outlet`).
