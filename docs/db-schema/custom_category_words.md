# custom_category_words

**Schema:** `public`
**Last touched by migration:** [`20261008143805_create_custom_categories_tables.sql`](../../supabase/migrations/20261008143805_create_custom_categories_tables.sql)

**Purpose:** Many-to-many join between [`custom_categories`](./custom_categories.md) and [`words`](./words.md) — same shape as [`word_categories`](./word_categories.md), but for user-created decks. Deleting a custom category or a word only removes the association row, not the other side.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `custom_category_id` | `uuid` | No | — | References `custom_categories.id`, `on delete cascade`. |
| `word_id` | `uuid` | No | — | References `words.id`, `on delete cascade`. |

## Constraints & indexes

- `PRIMARY KEY (custom_category_id, word_id)`
- `FOREIGN KEY (custom_category_id) REFERENCES custom_categories(id) ON DELETE CASCADE`
- `FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE`
- `INDEX (custom_category_id)` — supports the lookup "words in a custom deck", which also backs every RLS policy below via the `custom_categories` ownership check.

## Row Level Security

RLS is enabled. See [rls-policies/custom_category_words/](../rls-policies/custom_category_words/README.md): gated via the parent deck's owner (an `exists` subquery against `custom_categories`), not an `on` this table directly — there's no `user_id` column here to check. No update policy: a row either links a word to a deck or it doesn't, there's nothing on the row itself to update.

## Current DDL

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE TABLE IF NOT EXISTS "public"."custom_category_words" (
    "custom_category_id" "uuid" NOT NULL,
    "word_id" "uuid" NOT NULL
);

COMMENT ON TABLE "public"."custom_category_words" IS 'Many-to-many join between custom_categories and words -- same shape as word_categories, but for user-created decks.';

ALTER TABLE ONLY "public"."custom_category_words"
    ADD CONSTRAINT "custom_category_words_pkey" PRIMARY KEY ("custom_category_id", "word_id");

CREATE INDEX "custom_category_words_custom_category_id_idx" ON "public"."custom_category_words" USING "btree" ("custom_category_id");

ALTER TABLE ONLY "public"."custom_category_words"
    ADD CONSTRAINT "custom_category_words_custom_category_id_fkey" FOREIGN KEY ("custom_category_id") REFERENCES "public"."custom_categories"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."custom_category_words"
    ADD CONSTRAINT "custom_category_words_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE CASCADE;

ALTER TABLE "public"."custom_category_words" ENABLE ROW LEVEL SECURITY;
```
