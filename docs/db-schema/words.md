# words

**Schema:** `public`
**Last touched by migration:** [`20260918101738_create_flashcard_content_tables.sql`](../../supabase/migrations/20260918101738_create_flashcard_content_tables.sql)

**Purpose:** English vocabulary entries for the flashcard feature. Each word has one or more BSL sign variants ([`signs`](./signs.md)) and belongs to zero or more categories ([`word_categories`](./word_categories.md)).

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `word` | `text` | No | — | The English word (e.g. "Hello"). |
| `definition` | `text` | No | — | The word's definition, shown alongside the sign video. |

## Constraints & indexes

- `PRIMARY KEY (id)`
- `UNIQUE (word, definition)` — blocks exact-duplicate entries while still allowing genuine homonyms: the same `word` may appear more than once as long as each row has a different `definition` (e.g. two senses of "bank").

## Row Level Security

RLS is enabled. See [rls-policies/words/](../rls-policies/words/README.md): any authenticated user can read all rows; only `superadmin` can insert/update/delete.

## Current DDL

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE TABLE IF NOT EXISTS "public"."words" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "word" "text" NOT NULL,
    "definition" "text" NOT NULL
);

COMMENT ON TABLE "public"."words" IS 'English vocabulary entries. unique(word, definition) blocks exact duplicates while still allowing genuine homonyms (same word, different definition).';

ALTER TABLE ONLY "public"."words"
    ADD CONSTRAINT "words_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."words"
    ADD CONSTRAINT "words_word_definition_key" UNIQUE ("word", "definition");

ALTER TABLE "public"."words" ENABLE ROW LEVEL SECURITY;
```
