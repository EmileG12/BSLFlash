# custom_categories

**Schema:** `public`
**Last touched by migration:** [`20261008143805_create_custom_categories_tables.sql`](../../supabase/migrations/20261008143805_create_custom_categories_tables.sql)

**Purpose:** User-created decks assembled from [`words`](./words.md) — the "custom decks" counterpart to [`categories`](./categories.md), but owned by the user who built it rather than superadmin-curated reference data. These never appear in the standard category menus ([CategoryMenu](../components/CategoryMenu.md), [SelectDeckCard](../components/SelectDeckCard.md)'s standard listing), since those only query `categories`; custom decks are listed separately by [MyDecksPage](../components/MyDecksPage.md) via [useCustomCategories](../hooks/useCustomCategories.md).

`user_id` defaults to `auth.uid()`, so a plain `insert` from an authenticated client (e.g. the header insert inside [`create_custom_category`](../rpc-functions/create_custom_category.md)) is owned by the caller without the client needing to set it explicitly.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `user_id` | `uuid` | No | `auth.uid()` | Owner. References `auth.users.id`, `on delete cascade`. |
| `category_name` | `text` | No | — | Deck name, as entered by the user. |
| `created_at` | `timestamptz` | No | `now()` | Creation time. |

## Constraints & indexes

- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`
- `INDEX (user_id)` — supports the owner-scoped lookup every RLS policy and `useCustomCategories` query makes.

## Row Level Security

RLS is enabled. See [rls-policies/custom_categories/](../rls-policies/custom_categories/README.md): a user can only read/write their own rows (`user_id = auth.uid()`), unlike `categories`' "everyone reads, only superadmin writes" shape.

## Current DDL

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE TABLE IF NOT EXISTS "public"."custom_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "category_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

COMMENT ON TABLE "public"."custom_categories" IS 'User-created decks assembled from public.words. user_id is the owner -- these never appear in the standard category menus (those only query public.categories).';

ALTER TABLE ONLY "public"."custom_categories"
    ADD CONSTRAINT "custom_categories_pkey" PRIMARY KEY ("id");

CREATE INDEX "custom_categories_user_id_idx" ON "public"."custom_categories" USING "btree" ("user_id");

ALTER TABLE ONLY "public"."custom_categories"
    ADD CONSTRAINT "custom_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."custom_categories" ENABLE ROW LEVEL SECURITY;
```
