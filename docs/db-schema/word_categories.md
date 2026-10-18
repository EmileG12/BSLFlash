# word_categories

**Schema:** `public`
**Last touched by migration:** [`20261018221104_grant_table_privileges_to_anon_and_authenticated.sql`](../../supabase/migrations/20261018221104_grant_table_privileges_to_anon_and_authenticated.sql)

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

## Grants

- `SELECT`, `INSERT`, `UPDATE`, `DELETE` granted to `anon` and `authenticated`; `service_role` already had broader access.
- This is the table-level prerequisite Postgres checks before RLS runs. RLS remains the per-row, per-operation restriction: see [rls-policies/word_categories/](../rls-policies/word_categories/README.md).
- Granted explicitly because the table was created by a raw SQL migration, not the Table Editor, which normally adds these grants on a hosted project.

## Current grants

*From `npx supabase db dump --local --schema public`:*

```sql
GRANT ALL ON TABLE "public"."word_categories" TO "anon";
GRANT ALL ON TABLE "public"."word_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."word_categories" TO "service_role";
```

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
