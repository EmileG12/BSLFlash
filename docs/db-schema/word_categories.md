# word_categories

**Schema:** `public`
**Last touched by migration:** [`20260918101738_create_flashcard_content_tables.sql`](../../supabase/migrations/20260918101738_create_flashcard_content_tables.sql)

**Purpose:** Many-to-many join between [`words`](./words.md) and [`categories`](./categories.md) — a word can belong to more than one category (e.g. "Cat" could sit in both "Animals" and "BSL Level 1 Vocabulary"). Deleting a word or a category only removes the association row, not the other side.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `word_id` | `uuid` | No | — | References `words.id`, `on delete cascade`. |
| `category_id` | `uuid` | No | — | References `categories.id`, `on delete cascade`. |

## Constraints & indexes

- `PRIMARY KEY (word_id, category_id)` — also serves as the lookup index for "categories of a word".
- `FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE`
- `FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE`
- `INDEX (category_id)` — supports the reverse lookup, "words in a category".

## Row Level Security

RLS is enabled. See [rls-policies/word_categories/](../rls-policies/word_categories/README.md): any authenticated user can read all rows; only `superadmin` can insert/update/delete.

## Current DDL

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE TABLE IF NOT EXISTS "public"."word_categories" (
    "word_id" "uuid" NOT NULL,
    "category_id" "uuid" NOT NULL
);

COMMENT ON TABLE "public"."word_categories" IS 'Many-to-many join between words and categories -- a word can belong to more than one category.';

ALTER TABLE ONLY "public"."word_categories"
    ADD CONSTRAINT "word_categories_pkey" PRIMARY KEY ("word_id", "category_id");

CREATE INDEX "word_categories_category_id_idx" ON "public"."word_categories" USING "btree" ("category_id");

ALTER TABLE ONLY "public"."word_categories"
    ADD CONSTRAINT "word_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."word_categories"
    ADD CONSTRAINT "word_categories_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE CASCADE;

ALTER TABLE "public"."word_categories" ENABLE ROW LEVEL SECURITY;
```
