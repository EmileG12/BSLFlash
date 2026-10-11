# signs policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [signs_select_authenticated](./signs_select_authenticated.md) | SELECT | authenticated | Any logged-in user can read all rows. |
| [signs_insert_admin_or_superadmin](./signs_insert_admin_or_superadmin.md) | INSERT | authenticated | Admin or superadmin. |
| [signs_update_superadmin](./signs_update_superadmin.md) | UPDATE | authenticated | Superadmin only. |
| [signs_delete_superadmin](./signs_delete_superadmin.md) | DELETE | authenticated | Superadmin only. |

See [db-schema/signs.md](../../db-schema/signs.md) for the table itself.
