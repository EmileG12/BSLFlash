# SuperadminRoute

**Path:** `src/components/SuperadminRoute.tsx`

**Purpose:** Route guard for the `/superadmin/*` pages. Lets through only users holding the `superadmin` role; everyone else is redirected to `/`.

**Key behavior:** Reads [useUserRoles](../hooks/useUserRoles.md) and renders nothing while `loading` is true, then renders an `Outlet` or a redirect. A `superadmin` role is checked here only for UI routing. The database RPCs behind these pages re-check [`is_superadmin()`](../rpc-functions/is_superadmin.md) themselves, so this guard is not the security boundary.

Sits inside [ProtectedRoute](./ProtectedRoute.md) in the route tree.

**Depends on:** [useUserRoles](../hooks/useUserRoles.md).

**Used by:** the `/superadmin/*` routes in `src/App.tsx`, wrapping [SuperadminCategoriesPage](./SuperadminCategoriesPage.md), [SuperadminRolesPage](./SuperadminRolesPage.md), [SuperadminAccountsPage](./SuperadminAccountsPage.md), [SuperadminWordsPage](./SuperadminWordsPage.md) and [SuperadminWordEditPage](./SuperadminWordEditPage.md).
