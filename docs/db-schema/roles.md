# roles

**Schema:** `public`
**Last touched by migration:** [`20261018221104_grant_table_privileges_to_anon_and_authenticated.sql`](../../supabase/migrations/20261018221104_grant_table_privileges_to_anon_and_authenticated.sql)

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

Seeded rows are `superadmin`, `user`, and `admin`, each inserted by its own migration with `on conflict (role_name) do nothing`: `admin` by [`20261011193815_add_admin_role_and_is_admin_function.sql`](../../supabase/migrations/20261011193815_add_admin_role_and_is_admin_function.sql), `superadmin`/`user` by [`20261016162515_seed_user_and_superadmin_roles.sql`](../../supabase/migrations/20261016162515_seed_user_and_superadmin_roles.sql). Until the latter, `superadmin`/`user` only ever existed via `supabase/seed.sql` (local-only), so `handle_new_user` failed on any real signup against a hosted environment.

## Grants

- `SELECT`, `INSERT`, `UPDATE`, `DELETE` granted to `anon` and `authenticated`; `service_role` already had broader access.
- This is the table-level prerequisite Postgres checks before RLS runs. RLS remains the per-row, per-operation restriction: see [rls-policies/roles/](../rls-policies/roles/README.md).
- Granted explicitly because the table was created by a raw SQL migration, not the Table Editor, which normally adds these grants on a hosted project.

## Current grants

*From `npx supabase db dump --local --schema public`:*

```sql
GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";
```

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
