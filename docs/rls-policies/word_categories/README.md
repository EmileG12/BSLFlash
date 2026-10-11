# word_categories policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [word_categories_select_authenticated](./word_categories_select_authenticated.md) | SELECT | authenticated | Any logged-in user can read all rows. |
| [word_categories_insert_admin_or_superadmin](./word_categories_insert_admin_or_superadmin.md) | INSERT | authenticated | Admin or superadmin. |
| [word_categories_update_superadmin](./word_categories_update_superadmin.md) | UPDATE | authenticated | Superadmin only. |
| [word_categories_delete_admin_or_superadmin](./word_categories_delete_admin_or_superadmin.md) | DELETE | authenticated | Admin or superadmin. Lets an admin untag a wrong category from a word. |

See [db-schema/word_categories.md](../../db-schema/word_categories.md) for the table itself.
