# useUsersWithRoles.test.ts

**Path:** `src/hooks/useUsersWithRoles.test.ts`
**Tests:** [useUsersWithRoles](../hooks/useUsersWithRoles.md)

## Coverage

- Starts in a loading state with an empty `users` array.
- Returns every user with their roles and ban status.
- Sets an error message when the RPC fails.
- `setUsers` applies a local update (setting `banned_until` on one user) to the list.

## Notes

Mocks `../lib/supabase` with an `rpc` mock only, so the `list_users_with_roles` result is set directly. The superadmin-only check is enforced by the RPC itself and is not exercised here. Renders via the shared [`renderHookWithQueryClient`](../../src/test/renderHookWithQueryClient.tsx) helper (fresh `QueryClientProvider` with retries disabled, since the hook uses `useQuery`), with `act` and `waitFor` from `@testing-library/react`.
