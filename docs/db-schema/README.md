# Database schema

Tables, one doc file per table.

| Table | Purpose |
|---|---|
| [profiles](./profiles.md) | One row per app user; app-facing profile data. |
| [roles](./roles.md) | Lookup table of roles (`superadmin`, `user`). |
| [user_roles](./user_roles.md) | Junction table assigning roles to auth users. |

See [migrations.md](../migrations.md) for the workflow that keeps this in sync with `supabase/migrations/`.
