# AdminRoute

**Path:** `src/components/AdminRoute.tsx`

**Purpose:** Route guard for `/admin`. Lets through users holding the `admin` role and users holding the `superadmin` role, rendering the nested route via `Outlet`. Anyone else is redirected to `/`.

**Key behavior:** Reads [useUserRoles](../hooks/useUserRoles.md) and renders nothing while `loading` is true, so a user is not bounced to `/` before roles have resolved. Admin-or-superadmin is checked in the component, not in the database. Superadmin is a strict superset here, but [`is_admin()`](../rpc-functions/is_admin.md) itself does not return true for superadmins, so the two checks are kept separate and combined with `||` in this file.

Sits inside [ProtectedRoute](./ProtectedRoute.md) in the route tree, so a signed-out user never reaches it.

**Depends on:** [useUserRoles](../hooks/useUserRoles.md).

**Used by:** the `/admin` route in `src/App.tsx`, wrapping [AdminPage](./AdminPage.md).
