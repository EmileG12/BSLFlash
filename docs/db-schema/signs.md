# signs

**Schema:** `public`
**Last touched by migration:** [`20260918101738_create_flashcard_content_tables.sql`](../../supabase/migrations/20260918101738_create_flashcard_content_tables.sql)

**Purpose:** BSL sign variants for a [word](./words.md) — a word can have more than one sign (e.g. different regional variants). Each sign has one or more videos demonstrating it ([`sign_videos`](./sign_videos.md)).

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `word_id` | `uuid` | No | — | References `words.id`, `on delete cascade`. |
| `variant_name` | `text` | No | — | Describes which variant this is (e.g. "Standard", "One-handed"). |
| `region` | `text` | Yes | — | Region this variant is specific to (e.g. "Scotland"). Nullable — not every variant is region-specific, and forcing a value would mean inventing a placeholder like `'Any'`. |

## Constraints & indexes

- `PRIMARY KEY (id)`
- `UNIQUE (word_id, variant_name, region)` — blocks duplicate variant rows. Note Postgres treats each `NULL` in a unique constraint as distinct from every other `NULL`, so two rows with the same `word_id`/`variant_name` and `region = NULL` would both be allowed; not solved with a partial index since it's an unlikely edge case for curated content.
- `FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE`
- `INDEX (word_id)`

## Row Level Security

RLS is enabled. See [rls-policies/signs/](../rls-policies/signs/README.md): any authenticated user can read all rows; only `superadmin` can insert/update/delete.

## Current DDL

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE TABLE IF NOT EXISTS "public"."signs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "word_id" "uuid" NOT NULL,
    "variant_name" "text" NOT NULL,
    "region" "text"
);

COMMENT ON TABLE "public"."signs" IS 'BSL sign variants for a word (e.g. different regional signs for the same word). region is nullable for variants that are not region-specific.';

ALTER TABLE ONLY "public"."signs"
    ADD CONSTRAINT "signs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."signs"
    ADD CONSTRAINT "signs_word_id_variant_name_region_key" UNIQUE ("word_id", "variant_name", "region");

CREATE INDEX "signs_word_id_idx" ON "public"."signs" USING "btree" ("word_id");

ALTER TABLE ONLY "public"."signs"
    ADD CONSTRAINT "signs_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE CASCADE;

ALTER TABLE "public"."signs" ENABLE ROW LEVEL SECURITY;
```
