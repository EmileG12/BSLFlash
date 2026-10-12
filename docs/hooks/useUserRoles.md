# useUserRoles

**Path:** `src/hooks/useUserRoles.ts`
**Signature:** `useUserRoles(): { isAdmin: boolean; isSuperadmin: boolean; loading: boolean }`

**Purpose:** Reports whether the signed-in user holds the `admin` and/or `superadmin` role. Gates the admin entry in [NavBar](../components/NavBar.md) and [MobileNavSheet](../components/MobileNavSheet.md), and the [AdminRoute](../components/AdminRoute.md) and [SuperadminRoute](../components/SuperadminRoute.md) guards.

**Key behavior:** Resolves through the [`is_admin()`](../rpc-functions/is_admin.md) and [`is_superadmin()`](../rpc-functions/is_superadmin.md) RPCs, which are checked against the database, so the client never decides roles from its own state. Both RPCs are called in parallel with `Promise.all`.

The query is backed by React Query's `useQuery` under query key `['userRoles', userId]`, where `userId` is the session's user id, or `null` with no session. Each user has their own cache entry, so re-resolving after a session change is a key change rather than a manual re-run. The query is `enabled: !authLoading`, so it waits for [useAuth](./useAuth.md) to finish loading. When there is no session, the `queryFn` returns `{ isAdmin: false, isSuperadmin: false }` without calling either RPC.

`loading` is `authLoading || isPending`. A disabled query never settles, so `isPending` stays true until auth finishes. `isLoading` would be `false` during that window, and guards would act before roles were known. Guards render nothing while `loading` is `true`, so a user is not redirected before roles are known.

**Edge cases handled:** An RPC error or missing `data` is treated as `false` (`?? false`), not as a loading failure.

**Depends on:** [useAuth](./useAuth.md), [supabase-client](../utils/supabase-client.md).

**Used by:** [AdminRoute](../components/AdminRoute.md), [SuperadminRoute](../components/SuperadminRoute.md), [NavBar](../components/NavBar.md) (via `AdminNavEntry`), [MobileNavSheet](../components/MobileNavSheet.md) (via `AdminDisclosure`).

**Tested by:** [docs/tests/useUserRoles.md](../tests/useUserRoles.md).
