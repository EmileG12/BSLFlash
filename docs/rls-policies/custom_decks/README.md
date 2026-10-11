# custom_decks policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [custom_decks_select_own](./custom_decks_select_own.md) | SELECT | authenticated | Own rows, regardless of visibility. |
| [custom_decks_select_public](./custom_decks_select_public.md) | SELECT | authenticated | Rows with `is_public = true`, from any owner. |
| [custom_decks_insert_own](./custom_decks_insert_own.md) | INSERT | authenticated | Own rows only. |
| [custom_decks_update_own](./custom_decks_update_own.md) | UPDATE | authenticated | Own rows only. |
| [custom_decks_delete_own](./custom_decks_delete_own.md) | DELETE | authenticated | Own rows only. |

See [db-schema/custom_decks.md](../../db-schema/custom_decks.md) for the table itself. The two SELECT policies are permissive and combine with OR. Every write is scoped to `user_id = auth.uid()` — there is no superadmin override.
