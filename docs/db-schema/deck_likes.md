# deck_likes

**Schema:** `public`
**Last touched by migration:** [`20261011162530_create_deck_likes_table.sql`](../../supabase/migrations/20261011162530_create_deck_likes_table.sql)

**Purpose:** One row per user-like on a public [`custom_decks`](./custom_decks.md) row. Likes are a lightweight quality signal, separate from saving ([`saved_decks`](./saved_decks.md)): liking does not add the deck to your library, and saving does not like it. The directory sorts by like count, so likes are public. The like count and `liked_by_me` flag are computed by [`get_public_decks`](../rpc-functions/get_public_decks.md).

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `user_id` | `uuid` | No | `auth.uid()` | The user who liked the deck. References `auth.users.id`, `on delete cascade`. |
| `custom_deck_id` | `uuid` | No | — | The liked deck. References `custom_decks.id`, `on delete cascade`. |
| `created_at` | `timestamptz` | No | `now()` | When the like was added. |

## Constraints & indexes

- `PRIMARY KEY (user_id, custom_deck_id)`
- `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`
- `FOREIGN KEY (custom_deck_id) REFERENCES custom_decks(id) ON DELETE CASCADE`
- `INDEX (custom_deck_id)` — supports the per-deck like count.

## Row Level Security

RLS is enabled. See [rls-policies/deck_likes/](../rls-policies/deck_likes/README.md). Readable by any authenticated user for decks they can already see, since the directory displays counts for public decks. Insert and delete are own-row-only.

## Current DDL

*Reconstructed from the migration, not from a live `npx supabase db dump --local --schema public`. Verify against a live dump before relying on it.*

```sql
CREATE TABLE IF NOT EXISTS "public"."deck_likes" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "custom_deck_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

COMMENT ON TABLE "public"."deck_likes" IS 'One row per user-like on a public custom deck. A separate signal from saved_decks -- liking does not add the deck to your library, and saving does not like it.';

ALTER TABLE ONLY "public"."deck_likes"
    ADD CONSTRAINT "deck_likes_pkey" PRIMARY KEY ("user_id", "custom_deck_id");

CREATE INDEX "deck_likes_custom_deck_id_idx" ON "public"."deck_likes" USING "btree" ("custom_deck_id");

ALTER TABLE ONLY "public"."deck_likes"
    ADD CONSTRAINT "deck_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."deck_likes"
    ADD CONSTRAINT "deck_likes_custom_deck_id_fkey" FOREIGN KEY ("custom_deck_id") REFERENCES "public"."custom_decks"("id") ON DELETE CASCADE;

ALTER TABLE "public"."deck_likes" ENABLE ROW LEVEL SECURITY;
```
