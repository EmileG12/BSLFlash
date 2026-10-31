# Storage

Supabase Storage buckets, one doc file per bucket.

| Bucket | Purpose |
|---|---|
| [sign-videos](./sign-videos.md) | Video files demonstrating BSL signs, referenced by [`sign_videos.storage_path`](../db-schema/sign_videos.md). |

Buckets are created by migrations (an `insert into storage.buckets`), so `db reset` and `db push` provision them on every environment. `supabase/config.toml` has no active bucket declarations. RLS policies on `storage.objects` also live in `supabase/migrations/` like any other table policy — see the `migrations` skill.
