# useUserRoles

**Path:** `src/hooks/useUserRoles.ts`
**Signature:** `useUserRoles(): { isAdmin: boolean; isSuperadmin: boolean; loading: boolean }`

**Purpose:** Reports whether the signed-in user holds the `admin` and/or `superadmin` role. Gates the admin entry in [NavBar](../components/NavBar.md) and [MobileNavSheet](../components/MobileNavSheet.md), and the [AdminRoute](../components/AdminRoute.md) and [SuperadminRoute](../components/SuperadminRoute.md) guards.

**Key behavior:** Resolves through the [`is_admin()`](../rpc-functions/is_admin.md) and [`is_superadmin()`](../rpc-functions/is_superadmin.md) RPCs, which are checked against the database, so the client never decides roles from its own state. Both RPCs are called in parallel. Waits for [useAuth](./useAuth.md) to finish loading before doing anything. When there is no session, it resolves to `false`/`false` without calling either RPC. Re-resolves whenever the session changes.

`loading` starts `true` and only becomes `false` once the RPCs (or the no-session shortcut) have settled. Guards render nothing while it is `true`, so a user is not redirected before roles are known.

**Edge cases handled:** An RPC error or missing `data` is treated as `false` (`?? false`), not as a loading failure. A stale response from a previous session is dropped via a `cancelled` flag in the effect cleanup.

**Depends on:** [useAuth](./useAuth.md), [supabase-client](../utils/supabase-client.md).

**Used by:** [AdminRoute](../components/AdminRoute.md), [SuperadminRoute](../components/SuperadminRoute.md), [NavBar](../components/NavBar.md) (via `AdminNavEntry`), [MobileNavSheet](../components/MobileNavSheet.md) (via `AdminDisclosure`).
