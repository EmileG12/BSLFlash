# custom_deck_tags policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [custom_deck_tags_select_visible](./custom_deck_tags_select_visible.md) | SELECT | authenticated | Rows whose parent deck is owned by the caller or published. |
| [custom_deck_tags_insert_own](./custom_deck_tags_insert_own.md) | INSERT | authenticated | Rows whose parent deck is owned by the caller. |
| [custom_deck_tags_delete_own](./custom_deck_tags_delete_own.md) | DELETE | authenticated | Rows whose parent deck is owned by the caller. |

No update policy: a tag link either exists or doesn't.

See [db-schema/custom_deck_tags.md](../../db-schema/custom_deck_tags.md) for the table itself.
