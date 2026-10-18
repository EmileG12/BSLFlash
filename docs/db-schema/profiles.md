# profiles

**Schema:** `public`
**Last touched by migration:** [`20261018221104_grant_table_privileges_to_anon_and_authenticated.sql`](../../supabase/migrations/20261018221104_grant_table_privileges_to_anon_and_authenticated.sql) (originally created by [`20260917005233_create_rbac_tables.sql`](../../supabase/migrations/20260917005233_create_rbac_tables.sql))

**Purpose:** One row per app user, keyed to their `auth.users` account. Holds app-facing profile data (currently just a display name). Rows are normally created automatically by the [`handle_new_user`](../rpc-functions/handle_new_user.md) trigger when a new `auth.users` account is created (via signup), not inserted directly by the app.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `user_id` | `uuid` | No | — | FK to `auth.users(id)`, `ON DELETE CASCADE`. Unique — one profile per auth user. |
| `user_name` | `text` | Yes | — | Display name / username. Case-sensitive unique. Nullable at the column level — a profile can exist without a name via paths that don't go through the signup trigger (e.g. a user created directly in Studio) — but the trigger itself enforces it's always set for real signups. |

## Constraints & indexes

- `PRIMARY KEY (id)`
- `UNIQUE (user_id)` — enforces one profile per auth user; also backs the FK's index.
- `UNIQUE (user_name)` — case-sensitive. Enables "username already in use" detection during signup (a `unique_violation` raised by [`handle_new_user`](../rpc-functions/handle_new_user.md)). Multiple `NULL`s are allowed (`NULL` is never considered equal to another `NULL` under a unique constraint).
- `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` — a profile has no meaning once the underlying auth account is gone, so it's removed along with it.

## Row Level Security

RLS is enabled. See [rls-policies/profiles/](../rls-policies/profiles/README.md): a user can read/insert/update/delete only their own row (`user_id = auth.uid()`); `superadmin` can do all of the above on every row. One additional SELECT policy, [`profiles_select_public_deck_owner`](../rls-policies/profiles/profiles_select_public_deck_owner.md), makes a profile readable by any authenticated user when its owner has at least one published custom deck, so the public deck directory can show the creator's username.

## Grants

- `SELECT`, `INSERT`, `UPDATE`, `DELETE` granted to `anon` and `authenticated`; `service_role` already had broader access.
- This is the table-level prerequisite Postgres checks before RLS runs. RLS remains the per-row, per-operation restriction: see [rls-policies/profiles/](../rls-policies/profiles/README.md).
- Granted explicitly because the table was created by a raw SQL migration, not the Table Editor, which normally adds these grants on a hosted project.

## Current grants

*From `npx supabase db dump --local --schema public`:*

```sql
GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
```

## Current DDL

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_name" "text"
);

COMMENT ON TABLE "public"."profiles" IS 'One row per auth user, holding app-facing profile data.';

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_name_key" UNIQUE ("user_name");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
```
