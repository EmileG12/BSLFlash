# profiles

**Schema:** `public`
**Last touched by migration:** [`20260917005233_create_rbac_tables.sql`](../../supabase/migrations/20260917005233_create_rbac_tables.sql)

**Purpose:** One row per app user, keyed to their `auth.users` account. Holds app-facing profile data (currently just a display name).

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `user_id` | `uuid` | No | — | FK to `auth.users(id)`, `ON DELETE CASCADE`. Unique — one profile per auth user. |
| `user_name` | `text` | Yes | — | Display name. Nullable — a profile can exist before a name is set. |

## Constraints & indexes

- `PRIMARY KEY (id)`
- `UNIQUE (user_id)` — enforces one profile per auth user; also backs the FK's index.
- `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` — a profile has no meaning once the underlying auth account is gone, so it's removed along with it.

## Row Level Security

RLS is enabled. See [rls-policies/profiles/](../rls-policies/profiles/README.md): a user can read/insert/update/delete only their own row (`user_id = auth.uid()`); `superadmin` can do all of the above on every row.

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
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
```
