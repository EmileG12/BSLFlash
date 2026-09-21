# Database schema

Tables, one doc file per table.

| Table | Purpose |
|---|---|
| [profiles](./profiles.md) | One row per app user; app-facing profile data. |
| [roles](./roles.md) | Lookup table of roles (`superadmin`, `user`). |
| [user_roles](./user_roles.md) | Junction table assigning roles to auth users. |
| [categories](./categories.md) | Flashcard vocabulary categories/topics (e.g. Animals, Greetings). |
| [words](./words.md) | Flashcard English vocabulary entries. |
| [word_categories](./word_categories.md) | Junction table assigning words to categories (many-to-many). |
| [signs](./signs.md) | BSL sign variants for a word. |
| [sign_videos](./sign_videos.md) | Video files demonstrating a sign. |

See the `migrations` skill for the workflow that keeps this in sync with `supabase/migrations/`.
