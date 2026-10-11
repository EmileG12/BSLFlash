# Database schema

Tables, one doc file per table.

| Table | Purpose |
|---|---|
| [profiles](./profiles.md) | One row per app user; app-facing profile data. |
| [roles](./roles.md) | Lookup table of roles (`superadmin`, `admin`, `user`). |
| [user_roles](./user_roles.md) | Junction table assigning roles to auth users. |
| [categories](./categories.md) | Flashcard vocabulary categories/topics (e.g. Animals, Greetings); also the tag vocabulary for public decks. |
| [words](./words.md) | Flashcard English vocabulary entries. |
| [word_categories](./word_categories.md) | Junction table assigning words to categories (many-to-many). |
| [signs](./signs.md) | BSL sign variants for a word; one per word is the primary (quizzed) variant. |
| [sign_videos](./sign_videos.md) | Video files demonstrating a sign. |
| [custom_decks](./custom_decks.md) | User-created decks assembled from `words`, optionally published to the public directory. |
| [custom_deck_words](./custom_deck_words.md) | Junction table assigning words to custom decks (many-to-many). |
| [custom_deck_tags](./custom_deck_tags.md) | Junction table tagging a custom deck with `categories` rows, for directory filtering. |
| [saved_decks](./saved_decks.md) | Public decks a user has added to their library (live reference, not a copy). |
| [deck_likes](./deck_likes.md) | One row per user-like on a public deck. |

See the `migrations` skill for the workflow that keeps this in sync with `supabase/migrations/`.
