-- Account ban/unban RPCs for the superadmin Account Management page. A ban
-- sets auth.users.banned_until directly (SECURITY DEFINER, same rationale as
-- 20261011194007's functions) -- this is a real Supabase Auth ban, not an
-- app-level flag, so it blocks sign-in and token refresh immediately rather
-- than leaving an existing session usable until it happens to expire.
-- Banning never deletes data -- it's reversible via unban_user.

create or replace function public.ban_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
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

comment on function public.ban_user(uuid) is 'Superadmin-only: bans an account indefinitely (auth.users.banned_until = infinity), blocking sign-in and token refresh immediately. Blocks banning the last remaining active superadmin. Reversible via unban_user.';

create or replace function public.unban_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_superadmin() then
    raise exception 'Only superadmins can unban accounts';
  end if;

  update auth.users set banned_until = null where id = p_user_id;
end;
$$;

comment on function public.unban_user(uuid) is 'Superadmin-only: lifts a ban by clearing auth.users.banned_until.';

revoke all on function public.ban_user(uuid) from public;
revoke all on function public.ban_user(uuid) from anon;
grant execute on function public.ban_user(uuid) to authenticated;

revoke all on function public.unban_user(uuid) from public;
revoke all on function public.unban_user(uuid) from anon;
grant execute on function public.unban_user(uuid) to authenticated;
