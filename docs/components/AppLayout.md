# AppLayout

**Path:** `src/components/AppLayout.tsx`

**Purpose:** Layout wrapper for all authenticated pages — renders [NavBar](./NavBar.md) once, above whichever page is currently routed, and the [InstallBanner](./InstallBanner.md) beneath it.

**Props:** None.

**Key behavior:** Renders `<NavBar />`, then `<InstallBanner />`, then `<main>` wrapping `<Outlet />` (react-router's placeholder for whatever nested route matched). `InstallBanner` renders nothing unless the app is installable and not dismissed, and is hidden at the `lg` breakpoint. Used as the parent element of the protected route tree in `src/App.tsx`, so every page under it gets the nav bar and banner without repeating them per page.

**Depends on:** [NavBar](./NavBar.md), [InstallBanner](./InstallBanner.md), `react-router-dom` (`Outlet`).
