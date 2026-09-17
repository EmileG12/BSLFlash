# RPC functions

Postgres functions exposed via Supabase RPC, one doc file per function.

| Function | Signature | Purpose |
|---|---|---|
| [is_superadmin](./is_superadmin.md) | `is_superadmin() RETURNS boolean` | Checks whether the current user holds the `superadmin` role; used inside RLS policies, also directly callable. |

See [migrations.md](../migrations.md) for the workflow.
