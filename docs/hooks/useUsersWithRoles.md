# useUsersWithRoles

**Path:** `src/hooks/useUsersWithRoles.ts`
**Signature:** `useUsersWithRoles(): { users: UserWithRoles[]; loading: boolean; error: string | null; setUsers: React.Dispatch<React.SetStateAction<UserWithRoles[]>> }`

Where `UserWithRoles` is `{ user_id: string; email: string | null; user_name: string | null; banned_until: string | null; roles: string[] }`.

**Purpose:** Fetches every account with its roles and ban status, via the superadmin-only [`list_users_with_roles()`](../rpc-functions/list_users_with_roles.md) RPC. Shared by the [Roles](../components/SuperadminRolesPage.md) and [Accounts](../components/SuperadminAccountsPage.md) pages, which both need the same list.

**Key behavior:** Backed by React Query's `useQuery` under query key `['usersWithRoles']`. The `queryFn` calls `list_users_with_roles` and throws on error. The hook maps `isLoading`/`error`/`data` onto `loading`/`error`/`users`. Requires a `QueryClientProvider` ancestor (wired once in `main.tsx`).

The Roles and Accounts pages share one cache entry, so the second page to mount shows the cached list immediately while it refetches. `setUsers` is exposed so a page can apply a change locally after a grant, revoke, ban or unban, by patching the same cache entry.

**Edge cases handled:** A failed RPC leaves `users` empty and sets `error`, after React Query's retries (see [architecture](../architecture.md#data-flow)).

**Depends on:** [supabase-client](../utils/supabase-client.md), the [`list_users_with_roles`](../rpc-functions/list_users_with_roles.md) RPC.

**Used by:** [SuperadminRolesPage](../components/SuperadminRolesPage.md), [SuperadminAccountsPage](../components/SuperadminAccountsPage.md). `UserWithRoles` is also imported by [`isBanned`](../utils/userStatus.md).

**Tested by:** [docs/tests/useUsersWithRoles.md](../tests/useUsersWithRoles.md).
