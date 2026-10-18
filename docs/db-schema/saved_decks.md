# saved_decks

**Schema:** `public`
**Last touched by migration:** [`20261018221104_grant_table_privileges_to_anon_and_authenticated.sql`](../../supabase/migrations/20261018221104_grant_table_privileges_to_anon_and_authenticated.sql)

**Purpose:** Records that a user has added a public deck to their library from the [BrowseDecksPage](../components/BrowseDecksPage.md) directory. "Add to library" is a live reference by id to the original [`custom_decks`](./custom_decks.md) row, not a copy of the deck. The row is never cleaned up when the owner unpublishes. The select policy on `custom_decks` (`is_public OR owner`) is what hides the deck while it is unpublished, and it reappears without any action from the saving user if the owner republishes.

Kept separate from [`deck_likes`](./deck_likes.md): saving adds a deck to your library and is private; liking is a public quality signal. A deck can be liked without being saved, and saved without being liked.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `user_id` | `uuid` | No | `auth.uid()` | The user who saved the deck. References `auth.users.id`, `on delete cascade`. |
| `custom_deck_id` | `uuid` | No | — | The saved deck. References `custom_decks.id`, `on delete cascade`. |
| `created_at` | `timestamptz` | No | `now()` | When the deck was saved. |

## Constraints & indexes

- `PRIMARY KEY (user_id, custom_deck_id)`
- `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`
- `FOREIGN KEY (custom_deck_id) REFERENCES custom_decks(id) ON DELETE CASCADE`
- `INDEX (custom_deck_id)`

## Row Level Security

RLS is enabled. See [rls-policies/saved_decks/](../rls-policies/saved_decks/README.md). Fully private to the saving user: no other user can read whose library a deck is in.

## Grants

- `SELECT`, `INSERT`, `UPDATE`, `DELETE` granted to `anon` and `authenticated`; `service_role` already had broader access.
- This is the table-level prerequisite Postgres checks before RLS runs. RLS remains the per-row, per-operation restriction: see [rls-policies/saved_decks/](../rls-policies/saved_decks/README.md).
- Granted explicitly because the table was created by a raw SQL migration, not the Table Editor, which normally adds these grants on a hosted project.

## Current grants

*From `npx supabase db dump --local --schema public`:*

```sql
GRANT ALL ON TABLE "public"."saved_decks" TO "anon";
GRANT ALL ON TABLE "public"."saved_decks" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_decks" TO "service_role";
```

## Current DDL

*Reconstructed from the migration, not from a live `npx supabase db dump --local --schema public`. Verify against a live dump before relying on it.*

```sql
CREATE TABLE IF NOT EXISTS "public"."saved_decks" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "custom_deck_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

COMMENT ON TABLE "public"."saved_decks" IS 'Decks a user has added to their library from the public directory. A live reference (by id) to the original custom_decks row, not a copy -- disappears from view if the owner unpublishes, reappears if they republish.';

ALTER TABLE ONLY "public"."saved_decks"
    ADD CONSTRAINT "saved_decks_pkey" PRIMARY KEY ("user_id", "custom_deck_id");

CREATE INDEX "saved_decks_custom_deck_id_idx" ON "public"."saved_decks" USING "btree" ("custom_deck_id");

ALTER TABLE ONLY "public"."saved_decks"
    ADD CONSTRAINT "saved_decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."saved_decks"
    ADD CONSTRAINT "saved_decks_custom_deck_id_fkey" FOREIGN KEY ("custom_deck_id") REFERENCES "public"."custom_decks"("id") ON DELETE CASCADE;

ALTER TABLE "public"."saved_decks" ENABLE ROW LEVEL SECURITY;
```
