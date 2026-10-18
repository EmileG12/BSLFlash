# words

**Schema:** `public`
**Last touched by migration:** [`20261018221104_grant_table_privileges_to_anon_and_authenticated.sql`](../../supabase/migrations/20261018221104_grant_table_privileges_to_anon_and_authenticated.sql)

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

## Grants

- `SELECT`, `INSERT`, `UPDATE`, `DELETE` granted to `anon` and `authenticated`; `service_role` already had broader access.
- This is the table-level prerequisite Postgres checks before RLS runs. RLS remains the per-row, per-operation restriction: see [rls-policies/words/](../rls-policies/words/README.md).
- Granted explicitly because the table was created by a raw SQL migration, not the Table Editor, which normally adds these grants on a hosted project.

## Current grants

*From `npx supabase db dump --local --schema public`:*

```sql
GRANT ALL ON TABLE "public"."words" TO "anon";
GRANT ALL ON TABLE "public"."words" TO "authenticated";
GRANT ALL ON TABLE "public"."words" TO "service_role";
```

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
