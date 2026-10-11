# ban_user

**Signature:** `public.ban_user(p_user_id uuid) RETURNS void`
**Language:** PL/pgSQL, `SECURITY DEFINER`, `SET search_path = public`
**Last touched by migration:** [`20261011194031_create_account_ban_functions.sql`](../../supabase/migrations/20261011194031_create_account_ban_functions.sql)

**Purpose:** Bans an account indefinitely by setting `auth.users.banned_until = 'infinity'`. Called from the [Accounts](../components/SuperadminAccountsPage.md) page behind a confirming dialog.

**Why a real Auth ban, not an app-level flag:** setting `banned_until` makes Supabase Auth refuse sign-in and token refresh immediately. An app-level flag would leave an existing session usable until it expired.

**Why `'infinity'`:** Postgres's indefinite-ban sentinel. Clients must not parse it with `new Date()` (it yields an invalid date); see [`isBanned`](../utils/userStatus.md).

**Last-superadmin guard:** banning a superadmin is refused if no other active superadmin would remain (same definition of "active" as [`revoke_role`](./revoke_role.md)).

Reversible via [`unban_user`](./unban_user.md). Never deletes data.

Re-checks [`is_superadmin()`](./is_superadmin.md) itself.

## Grants

- `EXECUTE` revoked from `PUBLIC` and `anon`; granted to `authenticated`.

## Current definition

*Derived from the migration; to be confirmed against `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION public.ban_user(p_user_id uuid)
RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_remaining_active_superadmins integer;
begin
  if not public.is_superadmin() then
    raise exception 'Only superadmins can ban accounts';
  end if;

  if exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = p_user_id and r.role_name = 'superadmin'
  ) then
    select count(*) into v_remaining_active_superadmins
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    join auth.users u on u.id = ur.user_id
    where r.role_name = 'superadmin'
      and ur.user_id <> p_user_id
      and (u.banned_until is null or u.banned_until < now());

    if v_remaining_active_superadmins = 0 then
      raise exception 'Cannot ban the last remaining active superadmin';
    end if;
  end if;

  update auth.users set banned_until = 'infinity'::timestamptz where id = p_user_id;
end;
$$;

COMMENT ON FUNCTION public.ban_user(uuid) IS 'Superadmin-only: bans an account indefinitely (auth.users.banned_until = infinity), blocking sign-in and token refresh immediately. Blocks banning the last remaining active superadmin. Reversible via unban_user.';

REVOKE ALL ON FUNCTION public.ban_user(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ban_user(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.ban_user(uuid) TO authenticated;
```
