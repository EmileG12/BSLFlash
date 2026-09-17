# user_roles policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [user_roles_select_own_or_superadmin](./user_roles_select_own_or_superadmin.md) | SELECT | authenticated | Own row(s), or superadmin can read all. |
| [user_roles_insert_superadmin](./user_roles_insert_superadmin.md) | INSERT | authenticated | Superadmin only. |
| [user_roles_update_superadmin](./user_roles_update_superadmin.md) | UPDATE | authenticated | Superadmin only. |
| [user_roles_delete_superadmin](./user_roles_delete_superadmin.md) | DELETE | authenticated | Superadmin only. |

See [db-schema/user_roles.md](../../db-schema/user_roles.md) for the table itself.
