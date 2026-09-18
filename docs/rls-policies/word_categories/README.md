# word_categories policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [word_categories_select_authenticated](./word_categories_select_authenticated.md) | SELECT | authenticated | Any logged-in user can read all rows. |
| [word_categories_insert_superadmin](./word_categories_insert_superadmin.md) | INSERT | authenticated | Superadmin only. |
| [word_categories_update_superadmin](./word_categories_update_superadmin.md) | UPDATE | authenticated | Superadmin only. |
| [word_categories_delete_superadmin](./word_categories_delete_superadmin.md) | DELETE | authenticated | Superadmin only. |

See [db-schema/word_categories.md](../../db-schema/word_categories.md) for the table itself.
