# userStatus

**Path:** `src/lib/userStatus.ts`
**Signature:** `isBanned(user: UserWithRoles): boolean`

**Purpose:** Decides whether an account from [`useUsersWithRoles`](../hooks/useUsersWithRoles.md) is currently banned. Used by the [Accounts](../components/SuperadminAccountsPage.md) page to show ban status and choose between the Ban and Unban actions.

**Key behavior:** Returns `false` when `banned_until` is `null`. Returns `true` when it is the literal string `'infinity'`, which is how Postgres serialises an indefinite ban set by [`ban_user`](../rpc-functions/ban_user.md). Otherwise it compares `banned_until` to the current time.

**Why the `'infinity'` check is explicit:** `new Date('infinity')` does not throw. It returns an Invalid Date, and every comparison with an Invalid Date is `false`, so an indefinite ban would read as not banned. This was found in manual browser testing. The explicit check is what keeps it from being missed.

**Depends on:** [`UserWithRoles`](../hooks/useUsersWithRoles.md) type.

**Used by:** [SuperadminAccountsPage](../components/SuperadminAccountsPage.md).
