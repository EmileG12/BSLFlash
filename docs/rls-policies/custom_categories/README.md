# custom_categories policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [custom_categories_select_own](./custom_categories_select_own.md) | SELECT | authenticated | Own rows only. |
| [custom_categories_insert_own](./custom_categories_insert_own.md) | INSERT | authenticated | Own rows only. |
| [custom_categories_update_own](./custom_categories_update_own.md) | UPDATE | authenticated | Own rows only. |
| [custom_categories_delete_own](./custom_categories_delete_own.md) | DELETE | authenticated | Own rows only. |

See [db-schema/custom_categories.md](../../db-schema/custom_categories.md) for the table itself. Unlike [categories](../categories/README.md)' "everyone reads, only superadmin writes" shape, every command here is scoped to `user_id = auth.uid()` — there is no superadmin override.
