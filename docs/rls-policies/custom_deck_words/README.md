# custom_deck_words policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [custom_deck_words_select_own](./custom_deck_words_select_own.md) | SELECT | authenticated | Rows whose parent deck is owned by the caller. |
| [custom_deck_words_select_public](./custom_deck_words_select_public.md) | SELECT | authenticated | Rows whose parent deck is published (`is_public`). |
| [custom_deck_words_insert_own](./custom_deck_words_insert_own.md) | INSERT | authenticated | Rows whose parent deck is owned by the caller. |
| [custom_deck_words_delete_own](./custom_deck_words_delete_own.md) | DELETE | authenticated | Rows whose parent deck is owned by the caller. |

No update policy: a row either links a word to a deck or it doesn't, there's nothing on the row itself to update.

See [db-schema/custom_deck_words.md](../../db-schema/custom_deck_words.md) for the table itself. Every policy here is an `exists` subquery against `custom_decks`, since this table has no `user_id` of its own.
