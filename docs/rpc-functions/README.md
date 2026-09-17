# RPC functions

Postgres functions exposed via Supabase RPC, one doc file per function.

| Function | Signature | Purpose |
|---|---|---|
| [is_superadmin](./is_superadmin.md) | `is_superadmin() RETURNS boolean` | Checks whether the current user holds the `superadmin` role; used inside RLS policies, also directly callable. |
| [handle_new_user](./handle_new_user.md) | `handle_new_user() RETURNS trigger` | Trigger-only (not RPC-callable): auto-creates a `profiles` row + `user` role grant whenever a new `auth.users` row is inserted. |

See [migrations.md](../migrations.md) for the workflow.
