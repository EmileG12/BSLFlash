# is_admin

**Signature:** `public.is_admin() RETURNS boolean`
**Language:** SQL, `SECURITY DEFINER`, `STABLE`, `SET search_path = public`
**Last touched by migration:** [`20261011193815_add_admin_role_and_is_admin_function.sql`](../../supabase/migrations/20261011193815_add_admin_role_and_is_admin_function.sql)

**Purpose:** Returns whether the currently-authenticated user (`auth.uid()`) holds the `admin` role. Mirrors [`is_superadmin()`](./is_superadmin.md) exactly in shape and in why it is `SECURITY DEFINER` (the lookup against `user_roles`/`roles` must not recurse through those tables' own RLS). Used inside the admin-or-superadmin insert policies on `words`, `signs`, `sign_videos`, and `word_categories`, and directly callable via RPC for client-side gating.

**Does not return true for superadmins.** This is deliberate. The UI/routing layer ([`AdminRoute`](../components/AdminRoute.md)) treats superadmin as a strict superset of admin, but the database does not: a caller that wants "admin or superadmin" must compose both checks explicitly, `is_superadmin() OR is_admin()`. Each policy that grants admin access does exactly that.

`search_path` is pinned to `public` for the same hardening reason as `is_superadmin()`.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly (new functions in this local environment otherwise default to grants for `anon`).
- `EXECUTE` granted to `authenticated` only.

## Current definition

*Derived from the migration; to be confirmed against `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.role_name = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Returns whether the current auth.uid() holds the admin role. Used inside RLS policies; also directly callable via RPC. Does not return true for superadmins -- callers wanting "admin or superadmin" must check both.';

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
```

**Used by:** the `*_insert_admin_or_superadmin` policies on [`words`](../rls-policies/words/README.md), [`signs`](../rls-policies/signs/README.md), [`sign_videos`](../rls-policies/sign_videos/README.md), and [`word_categories`](../rls-policies/word_categories/README.md) (insert and delete), and the [`sign-videos` bucket](../storage/sign-videos.md) insert policy.
