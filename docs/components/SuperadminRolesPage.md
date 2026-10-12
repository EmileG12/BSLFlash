# SuperadminRolesPage

**Path:** `src/pages/SuperadminRolesPage.tsx` · **Route:** `/superadmin/roles` (behind [SuperadminRoute](./SuperadminRoute.md))

**Purpose:** Grants and revokes the `admin` and `superadmin` roles for every account. Each row shows the user's assignable roles as badges, with a grant control and a revoke link per role.

**Key behavior:**
- **Grant** uses a per-row Select (`admin` by default, or `superadmin`) and a Grant button, which calls [`assign_role`](../rpc-functions/assign_role.md). Granting a role the user already holds is a no-op on the client. On success the local row gains the role.
- **Revoke** opens a confirming Dialog. The server's guard is the one that matters: removing `superadmin` from the last active superadmin is refused by [`revoke_role`](../rpc-functions/revoke_role.md). That error is shown inline inside the Dialog, and the Dialog stays open so the admin can read it.
- The grant error is shown above the table, not in the dialog. Only revoke has a dialog.
- Only roles in the `admin`/`superadmin` set are shown and changed. The `user` role is granted automatically at sign-up and is not shown here.
- The search `Input` carries an explicit `bg-card dark:bg-card` so it reads as a solid control against the toolbar's gradient background — see [TableCard](./TableCard.md).

**Depends on:** [useUsersWithRoles](../hooks/useUsersWithRoles.md), the [`assign_role`](../rpc-functions/assign_role.md) and [`revoke_role`](../rpc-functions/revoke_role.md) RPCs, [TableCard](./TableCard.md), `Select`/`Dialog`/`Table`/`Badge`/`Button` from `src/components/ui/`.

**Used by:** the `/superadmin/roles` route in `src/App.tsx`, linked from [NavBar](./NavBar.md) and [MobileNavSheet](./MobileNavSheet.md).
