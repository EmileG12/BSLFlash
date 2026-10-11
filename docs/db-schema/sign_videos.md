# sign_videos

**Schema:** `public`
**Last touched by migration:** [`20261011193904_move_primary_flag_from_sign_videos_to_signs.sql`](../../supabase/migrations/20261011193904_move_primary_flag_from_sign_videos_to_signs.sql)

**Purpose:** Video files demonstrating a [sign](./signs.md), stored in the [`sign-videos`](../storage/sign-videos.md) Storage bucket. A sign may have several videos (reshoots, different angles). No video is pinned: quizzing picks one at random from the pool of its word's primary sign (see [`signs.is_primary`](./signs.md)).

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `sign_id` | `uuid` | No | — | References `signs.id`, `on delete cascade`. |
| `storage_path` | `text` | No | — | Path within the `sign-videos` bucket, e.g. `hello/standard.mp4`. |
| `format` | `text` | No | — | Video container format. Constrained to `'mp4'`/`'webm'` so an unsupported format can't silently break playback. Matches the bucket's `allowed_mime_types` restriction (see [storage/sign-videos.md](../storage/sign-videos.md)). |
| `duration_ms` | `integer` | No | — | Video duration in milliseconds. Must be `> 0`. |
| `width` | `integer` | No | — | Video width in pixels. Must be `> 0`. |
| `height` | `integer` | No | — | Video height in pixels. Must be `> 0`. |
| `file_size` | `bigint` | No | — | File size in bytes. `bigint`, not `integer` — video files can exceed the ~2GB range of `int4`. Must be `> 0`. |

## Constraints & indexes

- `PRIMARY KEY (id)`
- `UNIQUE (sign_id, storage_path)` — also the conflict target used by `scripts/seed-sign-videos.mjs`'s upsert.
- `CHECK (format IN ('mp4', 'webm'))`
- `CHECK (duration_ms > 0)`, `CHECK (width > 0)`, `CHECK (height > 0)`, `CHECK (file_size > 0)`
- `FOREIGN KEY (sign_id) REFERENCES signs(id) ON DELETE CASCADE`
- `INDEX (sign_id)`

## Row Level Security

RLS is enabled. See [rls-policies/sign_videos/](../rls-policies/sign_videos/README.md): any authenticated user can read all rows; `admin` or `superadmin` can insert; only `superadmin` can update/delete. See [storage/sign-videos.md](../storage/sign-videos.md) for the matching Storage bucket policies.

## Current DDL

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE TABLE IF NOT EXISTS "public"."sign_videos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sign_id" "uuid" NOT NULL,
    "storage_path" "text" NOT NULL,
    "format" "text" NOT NULL,
    "duration_ms" integer NOT NULL,
    "width" integer NOT NULL,
    "height" integer NOT NULL,
    "file_size" bigint NOT NULL,
    CONSTRAINT "sign_videos_duration_ms_check" CHECK (("duration_ms" > 0)),
    CONSTRAINT "sign_videos_file_size_check" CHECK (("file_size" > 0)),
    CONSTRAINT "sign_videos_format_check" CHECK (("format" = ANY (ARRAY['mp4'::"text", 'webm'::"text"]))),
    CONSTRAINT "sign_videos_height_check" CHECK (("height" > 0)),
    CONSTRAINT "sign_videos_width_check" CHECK (("width" > 0))
);

COMMENT ON TABLE "public"."sign_videos" IS 'Video files (in the sign-videos storage bucket) demonstrating a sign. A sign may have several videos; which one is shown during quizzing is picked at random from its variant''s pool, not pinned per-video (see public.signs.is_primary).';

ALTER TABLE ONLY "public"."sign_videos"
    ADD CONSTRAINT "sign_videos_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."sign_videos"
    ADD CONSTRAINT "sign_videos_sign_id_storage_path_key" UNIQUE ("sign_id", "storage_path");

CREATE INDEX "sign_videos_sign_id_idx" ON "public"."sign_videos" USING "btree" ("sign_id");

ALTER TABLE ONLY "public"."sign_videos"
    ADD CONSTRAINT "sign_videos_sign_id_fkey" FOREIGN KEY ("sign_id") REFERENCES "public"."signs"("id") ON DELETE CASCADE;

ALTER TABLE "public"."sign_videos" ENABLE ROW LEVEL SECURITY;
```
