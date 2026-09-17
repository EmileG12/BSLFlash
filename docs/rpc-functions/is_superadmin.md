# is_superadmin

**Signature:** `public.is_superadmin() RETURNS boolean`
**Language:** SQL, `SECURITY DEFINER`, `STABLE`, `SET search_path = public`
**Last touched by migration:** [`20260917005233_create_rbac_tables.sql`](../../supabase/migrations/20260917005233_create_rbac_tables.sql)

**Purpose:** Returns whether the currently-authenticated user (`auth.uid()`) holds the `superadmin` role. Its primary purpose is internal use inside RLS policies on [`roles`](../db-schema/roles.md), [`user_roles`](../db-schema/user_roles.md), and [`profiles`](../db-schema/profiles.md) to grant superadmin write/read-all access. It's declared `SECURITY DEFINER` specifically so the lookup inside it runs as the function owner (which bypasses RLS on `user_roles`/`roles` locally) rather than as the calling user — a `user_roles` policy calling a function that queries `user_roles` under the *caller's* RLS would otherwise recurse into the same policy indefinitely. It is also directly callable via RPC (`supabase.rpc('is_superadmin')`) by any `authenticated` client, e.g. for client-side UI/route gating.

`search_path` is pinned to `public` explicitly (rather than inheriting the caller's search_path) as hardening against search_path-hijacking attacks against `SECURITY DEFINER` functions.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly in the migration — newly created functions in this local environment default to direct `EXECUTE` grants for `anon`/`authenticated`/`service_role` (confirmed via `pg_default_acl`), so revoking from `PUBLIC` alone would not have excluded `anon`. Verified live: an `anon`-authenticated call to `rpc/is_superadmin` returns `42501 permission denied for function is_superadmin`.
- `EXECUTE` granted to `authenticated` only (and `service_role`, which bypasses RLS/grants entirely).

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE OR REPLACE FUNCTION "public"."is_superadmin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.role_name = 'superadmin'
  );
$$;

COMMENT ON FUNCTION "public"."is_superadmin"() IS 'Returns whether the current auth.uid() holds the superadmin role. Used inside RLS policies; also directly callable via RPC.';

REVOKE ALL ON FUNCTION "public"."is_superadmin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_superadmin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_superadmin"() TO "service_role";
```

**Used by:** every write policy on `roles` and `user_roles`, and every policy on `profiles`. See [rls-policies/](../rls-policies/README.md).
