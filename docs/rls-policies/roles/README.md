# roles policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [roles_select_authenticated](./roles_select_authenticated.md) | SELECT | authenticated | Any logged-in user can read all rows. |
| [roles_insert_superadmin](./roles_insert_superadmin.md) | INSERT | authenticated | Superadmin only. |
| [roles_update_superadmin](./roles_update_superadmin.md) | UPDATE | authenticated | Superadmin only. |
| [roles_delete_superadmin](./roles_delete_superadmin.md) | DELETE | authenticated | Superadmin only. |

See [db-schema/roles.md](../../db-schema/roles.md) for the table itself.
