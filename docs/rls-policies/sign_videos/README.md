# sign_videos policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [sign_videos_select_authenticated](./sign_videos_select_authenticated.md) | SELECT | authenticated | Any logged-in user can read all rows. |
| [sign_videos_insert_superadmin](./sign_videos_insert_superadmin.md) | INSERT | authenticated | Superadmin only. |
| [sign_videos_update_superadmin](./sign_videos_update_superadmin.md) | UPDATE | authenticated | Superadmin only. |
| [sign_videos_delete_superadmin](./sign_videos_delete_superadmin.md) | DELETE | authenticated | Superadmin only. |

See [db-schema/sign_videos.md](../../db-schema/sign_videos.md) for the table itself, and [storage/sign-videos.md](../../storage/sign-videos.md) for the matching Storage bucket policies (which govern the actual video files, not just these metadata rows).
