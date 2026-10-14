# list_users_with_roles

**Signature:** `public.list_users_with_roles() RETURNS TABLE(user_id uuid, email text, user_name text, banned_until timestamptz, roles text[])`
**Language:** PL/pgSQL, `STABLE`, `SECURITY DEFINER`, `SET search_path = public`
**Last touched by migration:** [`20261011194007_create_role_management_functions.sql`](../../supabase/migrations/20261011194007_create_role_management_functions.sql)

**Purpose:** Returns every account with its email, display name, ban status, and role names, ordered by email. Backs the [Roles](../components/SuperadminRolesPage.md) and [Accounts](../components/SuperadminAccountsPage.md) pages through [`useUsersWithRoles`](../hooks/useUsersWithRoles.md).

**Why `SECURITY DEFINER`:** authenticated clients have no access to `auth.users`, and `email` lives there. The function runs as its owner to read it.

**Why it re-checks `is_superadmin()` itself:** `auth.users` has no policy an ordinary authenticated user could pass anyway, so the explicit check exists to give a clear error (`Only superadmins can list users`) rather than an opaque permissions failure.

Roles are aggregated with `array_agg ... filter (where role_name is not null)`, so a user with no roles returns an empty array rather than `NULL`.

## Grants

- `EXECUTE` revoked from `PUBLIC` and `anon`; granted to `authenticated`.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE OR REPLACE FUNCTION "public"."list_users_with_roles"() RETURNS TABLE("user_id" "uuid", "email" "text", "user_name" "text", "banned_until" timestamp with time zone, "roles" "text"[])
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_superadmin() then
    raise exception 'Only superadmins can list users';
  end if;

  return query
  select
    u.id,
    u.email::text,
    p.user_name,
    u.banned_until,
    coalesce(array_agg(r.role_name) filter (where r.role_name is not null), array[]::text[])
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  left join public.user_roles ur on ur.user_id = u.id
  left join public.roles r on r.id = ur.role_id
  group by u.id, u.email, p.user_name, u.banned_until
  order by u.email;
end;
$$;

COMMENT ON FUNCTION "public"."list_users_with_roles"() IS 'Superadmin-only: every user with their email, display name, ban status, and role names. Backs the Roles Management and Account Management pages, which otherwise have no client-side access to auth.users.';

REVOKE ALL ON FUNCTION "public"."list_users_with_roles"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_users_with_roles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_users_with_roles"() TO "service_role";
```
