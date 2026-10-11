# RLS policies

Row Level Security policies, grouped by table into subfolders (one file per individual policy).

| Table | Policies |
|---|---|
| [profiles](./profiles/README.md) | Own-row read/write; superadmin can access all; read also open to any user whose owner has a published deck. |
| [roles](./roles/README.md) | Any authenticated user can read; superadmin-only writes. |
| [user_roles](./user_roles/README.md) | Own-row read (+ superadmin reads all); superadmin-only writes. |
| [categories](./categories/README.md) | Any authenticated user can read; superadmin-only writes. |
| [words](./words/README.md) | Any authenticated user can read; superadmin-only writes. |
| [word_categories](./word_categories/README.md) | Any authenticated user can read; superadmin-only writes. |
| [signs](./signs/README.md) | Any authenticated user can read; superadmin-only writes. |
| [sign_videos](./sign_videos/README.md) | Any authenticated user can read; superadmin-only writes. |
| [custom_decks](./custom_decks/README.md) | Owner-only write; read by owner or by anyone when `is_public`. No superadmin override. |
| [custom_deck_words](./custom_deck_words/README.md) | Owner (of the parent deck) write and read; read also open when the parent deck is public. No update policy. |
| [custom_deck_tags](./custom_deck_tags/README.md) | Read when the parent deck is visible; owner-only insert/delete. No update policy. |
| [saved_decks](./saved_decks/README.md) | Own rows only. |
| [deck_likes](./deck_likes/README.md) | Read when the parent deck is visible; own-row insert/delete. |

Superadmin checks are implemented via the [`is_superadmin()`](../rpc-functions/is_superadmin.md) `SECURITY DEFINER` helper, to avoid RLS recursion. See the `migrations` skill for the workflow.
