# revoke_role

**Signature:** `public.revoke_role(p_user_id uuid, p_role_name text) RETURNS void`
**Language:** PL/pgSQL, `SECURITY DEFINER`, `SET search_path = public`
**Last touched by migration:** [`20261011194007_create_role_management_functions.sql`](../../supabase/migrations/20261011194007_create_role_management_functions.sql)

**Purpose:** Removes the `admin` or `superadmin` role from a user. Called from the [Roles](../components/SuperadminRolesPage.md) page, behind a confirming dialog.

**Last-superadmin guard:** removing `superadmin` is refused if no *other* active superadmin would remain, where "active" means `banned_until` is null or in the past. The error surfaces inline in the Roles page's dialog, which stays open. Without this guard, the only superadmin could lock the app out of its own admin tooling. The same guard applies to [`ban_user`](./ban_user.md).

Only `admin` and `superadmin` are accepted (same restriction as [`assign_role`](./assign_role.md)). Re-checks [`is_superadmin()`](./is_superadmin.md) itself.

## Grants

- `EXECUTE` revoked from `PUBLIC` and `anon`; granted to `authenticated`.

## Current definition

*Derived from the migration; to be confirmed against `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION public.revoke_role(p_user_id uuid, p_role_name text)
RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_role_id uuid;
  v_remaining_active_superadmins integer;
begin
  if not public.is_superadmin() then
    raise exception 'Only superadmins can revoke roles';
  end if;

  if p_role_name not in ('admin', 'superadmin') then
    raise exception 'p_role_name must be ''admin'' or ''superadmin''';
  end if;

  select id into v_role_id from public.roles where role_name = p_role_name;
  if v_role_id is null then
    raise exception 'Unknown role %', p_role_name;
  end if;

  if p_role_name = 'superadmin' then
    select count(*) into v_remaining_active_superadmins
    from public.user_roles ur
    join auth.users u on u.id = ur.user_id
    where ur.role_id = v_role_id
      and ur.user_id <> p_user_id
      and (u.banned_until is null or u.banned_until < now());

    if v_remaining_active_superadmins = 0 then
      raise exception 'Cannot remove the last remaining active superadmin';
    end if;
  end if;

  delete from public.user_roles where user_id = p_user_id and role_id = v_role_id;
end;
$$;

COMMENT ON FUNCTION public.revoke_role(uuid, text) IS 'Superadmin-only: removes the admin or superadmin role from a user. Blocks removing the superadmin role from the last remaining active (non-banned) superadmin.';

REVOKE ALL ON FUNCTION public.revoke_role(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.revoke_role(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.revoke_role(uuid, text) TO authenticated;
```
