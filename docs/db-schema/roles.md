# roles

**Schema:** `public`
**Last touched by migration:** [`20261011193815_add_admin_role_and_is_admin_function.sql`](../../supabase/migrations/20261011193815_add_admin_role_and_is_admin_function.sql)

**Purpose:** Lookup table of the roles available in the app's role-based access control system (`superadmin`, `admin`, and `user`). `admin` is a separate role from `superadmin`, not a superset of it in the data — see [`is_admin()`](../rpc-functions/is_admin.md). Referenced by [`user_roles`](./user_roles.md) to assign a role to a specific auth user.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `role_name` | `text` | No | — | Unique short name for the role: `superadmin`, `admin`, `user`. Used by [`is_superadmin()`](../rpc-functions/is_superadmin.md) and [`is_admin()`](../rpc-functions/is_admin.md) and by client code to branch UI/routes. |
| `role_description` | `text` | Yes | — | Optional human-readable description of what the role can do. |

## Constraints & indexes

- `PRIMARY KEY (id)`
- `UNIQUE (role_name)` — also backs name lookups (e.g. inside `is_superadmin()`); no separate index needed.

## Row Level Security

RLS is enabled. See [rls-policies/roles/](../rls-policies/roles/README.md): any authenticated user can read all rows; only `superadmin` can insert/update/delete.

Seeded rows are `superadmin`, `user`, and `admin` (the `admin` row is inserted by the migration with `on conflict (role_name) do nothing`).

## Current DDL

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_name" "text" NOT NULL,
    "role_description" "text"
);

COMMENT ON TABLE "public"."roles" IS 'Lookup table of roles available in the app (e.g. superadmin, user).';
ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_role_name_key" UNIQUE ("role_name");

ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;
```
