# unban_user

**Signature:** `public.unban_user(p_user_id uuid) RETURNS void`
**Language:** PL/pgSQL, `SECURITY DEFINER`, `SET search_path = public`
**Last touched by migration:** [`20261011194031_create_account_ban_functions.sql`](../../supabase/migrations/20261011194031_create_account_ban_functions.sql)

**Purpose:** Lifts a ban by clearing `auth.users.banned_until`. Called from the [Accounts](../components/SuperadminAccountsPage.md) page as a plain button (no confirmation). Counterpart of [`ban_user`](./ban_user.md).

Re-checks [`is_superadmin()`](./is_superadmin.md) itself.

## Grants

- `EXECUTE` revoked from `PUBLIC` and `anon`; granted to `authenticated`.

## Current definition

*Derived from the migration; to be confirmed against `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION public.unban_user(p_user_id uuid)
RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.is_superadmin() then
    raise exception 'Only superadmins can unban accounts';
  end if;

  update auth.users set banned_until = null where id = p_user_id;
end;
$$;

COMMENT ON FUNCTION public.unban_user(uuid) IS 'Superadmin-only: lifts a ban by clearing auth.users.banned_until.';

REVOKE ALL ON FUNCTION public.unban_user(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.unban_user(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.unban_user(uuid) TO authenticated;
```
