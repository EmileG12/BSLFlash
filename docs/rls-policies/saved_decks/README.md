# saved_decks policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [saved_decks_select_own](./saved_decks_select_own.md) | SELECT | authenticated | Own rows only. |
| [saved_decks_insert_own](./saved_decks_insert_own.md) | INSERT | authenticated | Own rows only. |
| [saved_decks_delete_own](./saved_decks_delete_own.md) | DELETE | authenticated | Own rows only. |

No update policy: a save either exists or doesn't.

See [db-schema/saved_decks.md](../../db-schema/saved_decks.md) for the table itself.
