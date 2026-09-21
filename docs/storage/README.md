# Storage

Supabase Storage buckets, one doc file per bucket.

| Bucket | Purpose |
|---|---|
| [sign-videos](./sign-videos.md) | Video files demonstrating BSL signs, referenced by [`sign_videos.storage_path`](../db-schema/sign_videos.md). |

Buckets are declared in [`supabase/config.toml`](../../supabase/config.toml) (`[storage.buckets.*]`, applied by `npx supabase start`/`stop`, not by `db reset`). RLS policies on `storage.objects` live in `supabase/migrations/` like any other table policy — see the `migrations` skill.
