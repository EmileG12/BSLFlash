# SuperadminAccountsPage

**Path:** `src/pages/SuperadminAccountsPage.tsx` · **Route:** `/superadmin/accounts` (behind [SuperadminRoute](./SuperadminRoute.md))

**Purpose:** Bans, unbans, and permanently deletes accounts. Lists every user with an Active or Banned status badge.

**Key behavior:**
- **Ban** opens a confirming Dialog, then calls [`ban_user`](../rpc-functions/ban_user.md). Its error (the last-active-superadmin guard) is shown inline inside the Dialog, which stays open on failure. On success the local row is set to `banned_until: 'infinity'`.
- **Unban** is a plain button with no dialog, calling [`unban_user`](../rpc-functions/unban_user.md). Its error is shown above the table.
- **Delete** opens a confirming Dialog titled "Permanently delete {email}?", then calls [`delete_user`](../rpc-functions/delete_user.md). Its error (e.g. the last-active-superadmin guard) is shown inline inside the Dialog, which stays open on failure. On success the row is removed from the local list. Delete is the only `destructive`-styled action on the page; Ban and its confirm button use `outline`/`default` so the irreversible action reads as the most severe.
- **Status** comes from [`isBanned`](../utils/userStatus.md), which handles the `'infinity'` sentinel. The Ban/Unban button is chosen from the same check.
- **Search** is a client-side substring match on email or display name. The search `Input` carries an explicit `bg-card dark:bg-card` so it reads as a solid control against the toolbar's gradient background — see [TableCard](./TableCard.md).
- A ban is a real Supabase Auth ban, not an app flag. The Dialog copy says the user is signed out and cannot sign in until unbanned, and that their data is kept. The reason this is an Auth ban is recorded in [ban_user](../rpc-functions/ban_user.md).
- The Delete Dialog copy says the removal covers the account and its data (custom decks, saved decks, likes), is permanent, and points to Ban as the reversible option.

**Depends on:** [useUsersWithRoles](../hooks/useUsersWithRoles.md), [userStatus](../utils/userStatus.md), the [`ban_user`](../rpc-functions/ban_user.md), [`unban_user`](../rpc-functions/unban_user.md), and [`delete_user`](../rpc-functions/delete_user.md) RPCs, [TableCard](./TableCard.md), `Dialog`/`Table`/`Badge`/`Button`/`Input` from `src/components/ui/`.

**Used by:** the `/superadmin/accounts` route in `src/App.tsx`, linked from [NavBar](./NavBar.md) and [MobileNavSheet](./MobileNavSheet.md).
