# user_roles

**Schema:** `public`
**Last touched by migration:** [`20261018221104_grant_table_privileges_to_anon_and_authenticated.sql`](../../supabase/migrations/20261018221104_grant_table_privileges_to_anon_and_authenticated.sql)

**Purpose:** Junction table assigning roles (from [`roles`](./roles.md)) to auth users.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `user_id` | `uuid` | No | — | FK to `auth.users(id)`, `ON DELETE CASCADE`. |
| `role_id` | `uuid` | No | — | FK to `roles(id)`, `ON DELETE RESTRICT`. |

## Constraints & indexes

- `PRIMARY KEY (id)`
- `UNIQUE (user_id, role_id)` — prevents duplicate identical role grants; also indexes `user_id` lookups (leftmost column), which is what the `user_roles_select_own_or_superadmin` policy filters on.
- `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` — role assignments are meaningless once the user account is gone.
- `FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT` — deleting a role currently assigned to users is blocked rather than silently cascading; access-control assignments shouldn't disappear as a side effect.
- `user_roles_role_id_idx` on `(role_id)` — supports "which users have role X" lookups, not efficiently covered by the composite unique index alone.

## Row Level Security

RLS is enabled. See [rls-policies/user_roles/](../rls-policies/user_roles/README.md): a user can read their own role assignment(s); `superadmin` can read all; only `superadmin` can insert/update/delete.

## Grants

- `SELECT`, `INSERT`, `UPDATE`, `DELETE` granted to `anon` and `authenticated`; `service_role` already had broader access.
- This is the table-level prerequisite Postgres checks before RLS runs. RLS remains the per-row, per-operation restriction: see [rls-policies/user_roles/](../rls-policies/user_roles/README.md).
- Granted explicitly because the table was created by a raw SQL migration, not the Table Editor, which normally adds these grants on a hosted project.

## Current grants

*From `npx supabase db dump --local --schema public`:*

```sql
GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";
```

## Current DDL

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL
);

COMMENT ON TABLE "public"."user_roles" IS 'Junction table assigning roles to auth users.';

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_id_key" UNIQUE ("user_id", "role_id");

CREATE INDEX "user_roles_role_id_idx" ON "public"."user_roles" USING "btree" ("role_id");

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;
```
