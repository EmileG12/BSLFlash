# custom_deck_words

**Schema:** `public`
**Last touched by migration:** [`20261018221104_grant_table_privileges_to_anon_and_authenticated.sql`](../../supabase/migrations/20261018221104_grant_table_privileges_to_anon_and_authenticated.sql)

**Purpose:** Many-to-many join between [`custom_decks`](./custom_decks.md) and [`words`](./words.md) — same shape as [`word_categories`](./word_categories.md), but for user-created decks. Deleting a deck or a word only removes the association row, not the other side.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `custom_deck_id` | `uuid` | No | — | References `custom_decks.id`, `on delete cascade`. |
| `word_id` | `uuid` | No | — | References `words.id`, `on delete cascade`. |

## Constraints & indexes

- `PRIMARY KEY (custom_deck_id, word_id)`
- `FOREIGN KEY (custom_deck_id) REFERENCES custom_decks(id) ON DELETE CASCADE`
- `FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE`
- `INDEX (custom_deck_id)` — supports the lookup "words in a custom deck", which also backs every RLS policy below via the `custom_decks` ownership check.

Constraint names match the table (`custom_deck_words_pkey`, `custom_deck_words_custom_deck_id_fkey`, `custom_deck_words_word_id_fkey`) — a follow-up migration renamed them after the original table rename left them on the old `custom_category_words_` prefix.

## Row Level Security

RLS is enabled. See [rls-policies/custom_deck_words/](../rls-policies/custom_deck_words/README.md). Owner-scoped read/write is gated via the parent deck (an `exists` subquery against `custom_decks`), not an `on` this table directly — there's no `user_id` column here to check. A second, additive select policy lets any authenticated user read links belonging to a public deck. No update policy: a row either links a word to a deck or it doesn't, there's nothing on the row itself to update.

## Grants

- `SELECT`, `INSERT`, `UPDATE`, `DELETE` granted to `anon` and `authenticated`; `service_role` already had broader access.
- This is the table-level prerequisite Postgres checks before RLS runs. RLS remains the per-row, per-operation restriction: see [rls-policies/custom_deck_words/](../rls-policies/custom_deck_words/README.md).
- Granted explicitly because the table was created by a raw SQL migration, not the Table Editor, which normally adds these grants on a hosted project.

## Current grants

*From `npx supabase db dump --local --schema public`:*

```sql
GRANT ALL ON TABLE "public"."custom_deck_words" TO "anon";
GRANT ALL ON TABLE "public"."custom_deck_words" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_deck_words" TO "service_role";
```

## Current DDL

```sql
CREATE TABLE IF NOT EXISTS "public"."custom_deck_words" (
    "custom_deck_id" "uuid" NOT NULL,
    "word_id" "uuid" NOT NULL
);

COMMENT ON TABLE "public"."custom_deck_words" IS 'Many-to-many join between custom_decks and words -- same shape as word_categories, but for user-created decks.';

ALTER TABLE ONLY "public"."custom_deck_words"
    ADD CONSTRAINT "custom_deck_words_pkey" PRIMARY KEY ("custom_deck_id", "word_id");

CREATE INDEX "custom_deck_words_custom_deck_id_idx" ON "public"."custom_deck_words" USING "btree" ("custom_deck_id");

ALTER TABLE ONLY "public"."custom_deck_words"
    ADD CONSTRAINT "custom_deck_words_custom_deck_id_fkey" FOREIGN KEY ("custom_deck_id") REFERENCES "public"."custom_decks"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."custom_deck_words"
    ADD CONSTRAINT "custom_deck_words_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE CASCADE;

ALTER TABLE "public"."custom_deck_words" ENABLE ROW LEVEL SECURITY;
```
