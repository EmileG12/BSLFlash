# deck_likes policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [deck_likes_select_visible](./deck_likes_select_visible.md) | SELECT | authenticated | Rows whose parent deck is owned by the caller or published. |
| [deck_likes_insert_own](./deck_likes_insert_own.md) | INSERT | authenticated | Own rows only. |
| [deck_likes_delete_own](./deck_likes_delete_own.md) | DELETE | authenticated | Own rows only. |

No update policy: a like either exists or doesn't.

See [db-schema/deck_likes.md](../../db-schema/deck_likes.md) for the table itself.
