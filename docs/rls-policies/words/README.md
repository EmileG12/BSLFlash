# words policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [words_select_authenticated](./words_select_authenticated.md) | SELECT | authenticated | Any logged-in user can read all rows. |
| [words_insert_admin_or_superadmin](./words_insert_admin_or_superadmin.md) | INSERT | authenticated | Admin or superadmin. |
| [words_update_superadmin](./words_update_superadmin.md) | UPDATE | authenticated | Superadmin only. |
| [words_delete_superadmin](./words_delete_superadmin.md) | DELETE | authenticated | Superadmin only. |

See [db-schema/words.md](../../db-schema/words.md) for the table itself.
