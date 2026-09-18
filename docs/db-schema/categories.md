# categories

**Schema:** `public`
**Last touched by migration:** [`20260918101738_create_flashcard_content_tables.sql`](../../supabase/migrations/20260918101738_create_flashcard_content_tables.sql)

**Purpose:** Vocabulary categories/topics for the flashcard feature (e.g. Animals, Greetings, BSL Level 1 Vocabulary). Linked to [`words`](./words.md) via the [`word_categories`](./word_categories.md) many-to-many join table.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `category_name` | `text` | No | — | Unique, case-sensitive category name. |

## Constraints & indexes

- `PRIMARY KEY (id)`
- `UNIQUE (category_name)`

## Row Level Security

RLS is enabled. See [rls-policies/categories/](../rls-policies/categories/README.md): any authenticated user can read all rows; only `superadmin` can insert/update/delete.

## Current DDL

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_name" "text" NOT NULL
);

COMMENT ON TABLE "public"."categories" IS 'Vocabulary categories/topics (e.g. Animals, Greetings, BSL Level 1 Vocabulary).';

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_category_name_key" UNIQUE ("category_name");

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
```
