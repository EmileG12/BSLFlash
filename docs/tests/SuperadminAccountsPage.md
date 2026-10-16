# SuperadminAccountsPage.test.tsx

**Path:** `src/pages/SuperadminAccountsPage.test.tsx`
**Tests:** [SuperadminAccountsPage](../components/SuperadminAccountsPage.md)
**Suite:** `unit` (run via `npm run test` or `npx vitest run --project=unit`)

## Coverage

- Lists users with the correct status badge and the right actions per status: Ban and Delete for an active account, Unban and Delete for a banned one.
- Cancelling the delete dialog leaves the account in the list and makes no `delete_user` call.
- Confirming delete calls `delete_user` with the account's `p_user_id` and removes the account from the list.
- A failed `delete_user` (e.g. the last-remaining-superadmin guard) shows the error inside the dialog and keeps the account in the list.
- Confirming ban calls `ban_user` and flips the row to Banned, showing Unban.

Not covered: the Unban call, the search filter, and the ban failure path.

## Notes

Mocks `../lib/supabase` with `rpc` only. A `mockBackend` helper answers `list_users_with_roles` with two fixed users (one active, one banned) and resolves every other RPC with no error. The failure case overrides the mock to return an error for `delete_user`. Renders via [renderWithQueryClient](./renderWithQueryClient.md), since the page reads its list through [useUsersWithRoles](../hooks/useUsersWithRoles.md), which requires a `QueryClientProvider` ancestor.
