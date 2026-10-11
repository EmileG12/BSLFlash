# useUsersWithRoles

**Path:** `src/hooks/useUsersWithRoles.ts`
**Signature:** `useUsersWithRoles(): { users: UserWithRoles[]; loading: boolean; error: string | null; setUsers: React.Dispatch<React.SetStateAction<UserWithRoles[]>> }`

Where `UserWithRoles` is `{ user_id: string; email: string | null; user_name: string | null; banned_until: string | null; roles: string[] }`.

**Purpose:** Fetches every account with its roles and ban status, via the superadmin-only [`list_users_with_roles()`](../rpc-functions/list_users_with_roles.md) RPC. Shared by the [Roles](../components/SuperadminRolesPage.md) and [Accounts](../components/SuperadminAccountsPage.md) pages, which both need the same list.

**Key behavior:** Fetches once on mount; there is no refetch. `setUsers` is exposed so a page can apply a change locally after a grant, revoke, ban or unban, without re-running the list query.

**Edge cases handled:** A failed RPC sets `error` and leaves `users` empty. A response that arrives after unmount is ignored via a `cancelled` flag.

**Depends on:** [supabase-client](../utils/supabase-client.md), the [`list_users_with_roles`](../rpc-functions/list_users_with_roles.md) RPC.

**Used by:** [SuperadminRolesPage](../components/SuperadminRolesPage.md), [SuperadminAccountsPage](../components/SuperadminAccountsPage.md). `UserWithRoles` is also imported by [`isBanned`](../utils/userStatus.md).
