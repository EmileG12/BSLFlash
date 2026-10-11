# custom_deck_tags

**Schema:** `public`
**Last touched by migration:** [`20261011162527_create_custom_deck_tags_table.sql`](../../supabase/migrations/20261011162527_create_custom_deck_tags_table.sql)

**Purpose:** Many-to-many join tagging a [`custom_decks`](./custom_decks.md) row with rows from [`categories`](./categories.md), so the public deck directory can filter by tag. Tags reuse the `categories` table rather than a dedicated tags table: one table of labels serves both word grouping ([`word_categories`](./word_categories.md)) and deck tagging. A label that should never apply to a word (for example, an organisation-partnership label) can be a `categories` row with no `word_categories` links; [`get_categories_with_words`](../rpc-functions/get_categories_with_words.md) keeps such rows out of the standard deck-selection menus.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `custom_deck_id` | `uuid` | No | — | References `custom_decks.id`, `on delete cascade`. |
| `category_id` | `uuid` | No | — | References `categories.id`, `on delete cascade`. |

## Constraints & indexes

- `PRIMARY KEY (custom_deck_id, category_id)`
- `FOREIGN KEY (custom_deck_id) REFERENCES custom_decks(id) ON DELETE CASCADE`
- `FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE`
- `INDEX (category_id)` — supports the tag-filter lookup in [`get_public_decks`](../rpc-functions/get_public_decks.md) and [`get_available_deck_tags`](../rpc-functions/get_available_deck_tags.md).

## Row Level Security

RLS is enabled. See [rls-policies/custom_deck_tags/](../rls-policies/custom_deck_tags/README.md). Select follows whatever `custom_decks` rows the caller can see (their own, or any public deck). Insert and delete are owner-only. There is no update policy: a tag link either exists or does not.

## Current DDL

*Reconstructed from the migration, not from a live `npx supabase db dump --local --schema public`. Verify against a live dump before relying on it.*

```sql
CREATE TABLE IF NOT EXISTS "public"."custom_deck_tags" (
    "custom_deck_id" "uuid" NOT NULL,
    "category_id" "uuid" NOT NULL
);

COMMENT ON TABLE "public"."custom_deck_tags" IS 'Many-to-many join tagging a custom deck with rows from public.categories, for filtering the public deck directory. Reuses categories instead of a separate tags table.';

ALTER TABLE ONLY "public"."custom_deck_tags"
    ADD CONSTRAINT "custom_deck_tags_pkey" PRIMARY KEY ("custom_deck_id", "category_id");

CREATE INDEX "custom_deck_tags_category_id_idx" ON "public"."custom_deck_tags" USING "btree" ("category_id");

ALTER TABLE ONLY "public"."custom_deck_tags"
    ADD CONSTRAINT "custom_deck_tags_custom_deck_id_fkey" FOREIGN KEY ("custom_deck_id") REFERENCES "public"."custom_decks"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."custom_deck_tags"
    ADD CONSTRAINT "custom_deck_tags_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;

ALTER TABLE "public"."custom_deck_tags" ENABLE ROW LEVEL SECURITY;
```
