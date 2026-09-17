# Components

React components, one doc file per component.

| Component | Path | Purpose |
|---|---|---|
| [LoginPage](./LoginPage.md) | `src/pages/LoginPage.tsx` | Email/password login form. |
| [HomePage](./HomePage.md) | `src/pages/HomePage.tsx` | Placeholder landing page for logged-in users. |
| [NavBar](./NavBar.md) | `src/components/NavBar.tsx` | Top nav bar (Home link + Sign Out) shown on all authenticated pages. |
| [AppLayout](./AppLayout.md) | `src/components/AppLayout.tsx` | Wraps authenticated pages with `NavBar`. |
| [ProtectedRoute](./ProtectedRoute.md) | `src/components/ProtectedRoute.tsx` | Redirects to `/login` when signed out. |
| [GuestRoute](./GuestRoute.md) | `src/components/GuestRoute.tsx` | Redirects to `/` when already signed in. |
