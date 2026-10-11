# signs

**Schema:** `public`
**Last touched by migration:** [`20261011193904_move_primary_flag_from_sign_videos_to_signs.sql`](../../supabase/migrations/20261011193904_move_primary_flag_from_sign_videos_to_signs.sql)

**Purpose:** BSL sign variants for a [word](./words.md) — a word can have more than one sign (e.g. different regional variants). Each sign has zero or more videos demonstrating it ([`sign_videos`](./sign_videos.md)).

`is_primary` marks which variant of a word is the canonical/educational one shown during quizzing. At most one variant per word may be primary. Quizzing then picks a random video from that variant's pool each time, so learners can't memorise a specific take or person rather than the sign itself. The flag used to live on `sign_videos`; it moved here so that the choice is between variants, not between takes. Flipping it goes through [`set_primary_sign`](../rpc-functions/set_primary_sign.md), which un-sets the previous primary and sets the new one in one transaction.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `word_id` | `uuid` | No | — | References `words.id`, `on delete cascade`. |
| `variant_name` | `text` | No | — | Describes which variant this is (e.g. "Standard", "One-handed"). |
| `region` | `text` | Yes | — | Region this variant is specific to (e.g. "Scotland"). Nullable — not every variant is region-specific, and forcing a value would mean inventing a placeholder like `'Any'`. |
| `is_primary` | `boolean` | No | `false` | Whether this is the canonical variant for its word. At most one `true` per `word_id`, enforced by `signs_one_primary_per_word`. |

## Constraints & indexes

- `PRIMARY KEY (id)`
- `UNIQUE INDEX signs_one_primary_per_word ON (word_id) WHERE is_primary` — partial unique index; the database, not just app code, rejects a second primary variant for the same word.
- `UNIQUE (word_id, variant_name, region)` — blocks duplicate variant rows. Note Postgres treats each `NULL` in a unique constraint as distinct from every other `NULL`, so two rows with the same `word_id`/`variant_name` and `region = NULL` would both be allowed; not solved with a partial index since it's an unlikely edge case for curated content.
- `FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE`
- `INDEX (word_id)`

## Row Level Security

RLS is enabled. See [rls-policies/signs/](../rls-policies/signs/README.md): any authenticated user can read all rows; `admin` or `superadmin` can insert; only `superadmin` can update/delete.

## Current DDL

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE TABLE IF NOT EXISTS "public"."signs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "word_id" "uuid" NOT NULL,
    "variant_name" "text" NOT NULL,
    "region" "text",
    "is_primary" boolean DEFAULT false NOT NULL
);

COMMENT ON TABLE "public"."signs" IS 'BSL sign variants for a word (e.g. different regional signs for the same word). region is nullable for variants that are not region-specific.';

COMMENT ON COLUMN "public"."signs"."is_primary" IS 'Whether this is the accepted/educational variant shown during quizzing for its word. At most one true per word_id (see signs_one_primary_per_word). Set via public.set_primary_sign() to flip atomically.';

ALTER TABLE ONLY "public"."signs"
    ADD CONSTRAINT "signs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."signs"
    ADD CONSTRAINT "signs_word_id_variant_name_region_key" UNIQUE ("word_id", "variant_name", "region");

CREATE INDEX "signs_word_id_idx" ON "public"."signs" USING "btree" ("word_id");

CREATE UNIQUE INDEX "signs_one_primary_per_word" ON "public"."signs" USING "btree" ("word_id") WHERE "is_primary";

ALTER TABLE ONLY "public"."signs"
    ADD CONSTRAINT "signs_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE CASCADE;

ALTER TABLE "public"."signs" ENABLE ROW LEVEL SECURITY;
```
