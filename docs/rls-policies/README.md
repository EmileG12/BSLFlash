# RLS policies

Row Level Security policies, grouped by table into subfolders (one file per individual policy).

| Table | Policies |
|---|---|
| [profiles](./profiles/README.md) | Own-row read/write; superadmin can access all. |
| [roles](./roles/README.md) | Any authenticated user can read; superadmin-only writes. |
| [user_roles](./user_roles/README.md) | Own-row read (+ superadmin reads all); superadmin-only writes. |
| [categories](./categories/README.md) | Any authenticated user can read; superadmin-only writes. |
| [words](./words/README.md) | Any authenticated user can read; superadmin-only writes. |
| [word_categories](./word_categories/README.md) | Any authenticated user can read; superadmin-only writes. |
| [signs](./signs/README.md) | Any authenticated user can read; superadmin-only writes. |
| [sign_videos](./sign_videos/README.md) | Any authenticated user can read; superadmin-only writes. |
| [custom_categories](./custom_categories/README.md) | Owner-only read/write; no superadmin override. |
| [custom_category_words](./custom_category_words/README.md) | Owner (of the parent deck)-only read/write; no update policy. |

Superadmin checks are implemented via the [`is_superadmin()`](../rpc-functions/is_superadmin.md) `SECURITY DEFINER` helper, to avoid RLS recursion. See the `migrations` skill for the workflow.
