# custom_decks

**Schema:** `public`
**Last touched by migration:** [`20261018221104_grant_table_privileges_to_anon_and_authenticated.sql`](../../supabase/migrations/20261018221104_grant_table_privileges_to_anon_and_authenticated.sql)

**Purpose:** User-created decks assembled from [`words`](./words.md) — the "custom decks" counterpart to [`categories`](./categories.md), but owned by the user who built it rather than superadmin-curated reference data. These never appear in the standard category menus ([CategoryMenu](../components/CategoryMenu.md), [SelectDeckCard](../components/SelectDeckCard.md)'s standard listing), since those only query `categories`; a user's own decks are listed by [MyDecksPage](../components/MyDecksPage.md) via [useCustomDecks](../hooks/useCustomDecks.md).

`is_public` opts a deck into the public deck directory ([BrowseDecksPage](../components/BrowseDecksPage.md), via [`get_public_decks`](../rpc-functions/get_public_decks.md)). The owner sets it through [`update_custom_deck`](../rpc-functions/update_custom_deck.md) when saving the deck. Turning it off stops the deck matching the public-read policies below; it deletes nothing downstream, so [`saved_decks`](./saved_decks.md) and [`deck_likes`](./deck_likes.md) rows for the deck remain and become visible again if the owner republishes.

`user_id` defaults to `auth.uid()`, so a plain `insert` from an authenticated client (e.g. the header insert inside [`create_custom_deck`](../rpc-functions/create_custom_deck.md)) is owned by the caller without the client needing to set it explicitly.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `user_id` | `uuid` | No | `auth.uid()` | Owner. References `auth.users.id`, `on delete cascade`. |
| `deck_name` | `text` | No | — | Deck name, as entered by the user. |
| `created_at` | `timestamptz` | No | `now()` | Creation time. |
| `is_public` | `boolean` | No | `false` | Whether the deck appears in the public deck directory and is readable by all authenticated users. |

## Constraints & indexes

- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`
- `INDEX (user_id)` — supports the owner-scoped lookup every RLS policy and `useCustomDecks` query makes.

Constraint names match the table (`custom_decks_pkey`, `custom_decks_user_id_fkey`) — a follow-up migration renamed them after the original table rename left them on the old `custom_categories_` prefix.

## Row Level Security

RLS is enabled. See [rls-policies/custom_decks/](../rls-policies/custom_decks/README.md). Owners get full read/write on their own rows (`user_id = auth.uid()`). Any authenticated user can additionally read rows where `is_public` is `true`; these are OR-ed with the owner policy, so a deck is readable if either holds. There is no superadmin override, unlike `categories`' "everyone reads, only superadmin writes" shape.

## Grants

- `SELECT`, `INSERT`, `UPDATE`, `DELETE` granted to `anon` and `authenticated`; `service_role` already had broader access.
- This is the table-level prerequisite Postgres checks before RLS runs. RLS remains the per-row, per-operation restriction: see [rls-policies/custom_decks/](../rls-policies/custom_decks/README.md).
- Granted explicitly because the table was created by a raw SQL migration, not the Table Editor, which normally adds these grants on a hosted project.

## Current grants

*From `npx supabase db dump --local --schema public`:*

```sql
GRANT ALL ON TABLE "public"."custom_decks" TO "anon";
GRANT ALL ON TABLE "public"."custom_decks" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_decks" TO "service_role";
```

## Current DDL

```sql
CREATE TABLE IF NOT EXISTS "public"."custom_decks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "deck_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_public" boolean DEFAULT false NOT NULL
);

COMMENT ON TABLE "public"."custom_decks" IS 'User-created decks assembled from public.words. user_id is the owner -- these never appear in the standard category menus (those only query public.categories).';

ALTER TABLE ONLY "public"."custom_decks"
    ADD CONSTRAINT "custom_decks_pkey" PRIMARY KEY ("id");

CREATE INDEX "custom_decks_user_id_idx" ON "public"."custom_decks" USING "btree" ("user_id");

ALTER TABLE ONLY "public"."custom_decks"
    ADD CONSTRAINT "custom_decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."custom_decks" ENABLE ROW LEVEL SECURITY;
```
