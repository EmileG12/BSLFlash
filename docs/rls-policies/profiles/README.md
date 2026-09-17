# profiles policies

| Policy | Command | Applies to | Behavior |
|---|---|---|---|
| [profiles_select_own_or_superadmin](./profiles_select_own_or_superadmin.md) | SELECT | authenticated | Own row, or superadmin can read all. |
| [profiles_insert_own_or_superadmin](./profiles_insert_own_or_superadmin.md) | INSERT | authenticated | Own row, or superadmin can insert for anyone. |
| [profiles_update_own_or_superadmin](./profiles_update_own_or_superadmin.md) | UPDATE | authenticated | Own row, or superadmin can update any. |
| [profiles_delete_own_or_superadmin](./profiles_delete_own_or_superadmin.md) | DELETE | authenticated | Own row, or superadmin can delete any. |

See [db-schema/profiles.md](../../db-schema/profiles.md) for the table itself.
