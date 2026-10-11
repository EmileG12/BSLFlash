-- Role management RPCs for the superadmin Roles Management page. All
-- SECURITY DEFINER (owned by the migration-running role, which has access
-- to auth.users) since list_users_with_roles needs to read auth.users.email,
-- which authenticated users have no RLS access to otherwise. Each function
-- re-checks is_superadmin() itself rather than relying solely on RLS, since
-- auth.users has no policies an ordinary authenticated user could pass
-- anyway -- the explicit check gives a clear error instead of an opaque
-- permissions failure.
--
-- Only 'admin' and 'superadmin' are assignable/revocable through this
-- surface -- 'user' is granted automatically by handle_new_user and isn't
-- meant to be managed by hand.

create or replace function public.list_users_with_roles()
returns table (
  user_id uuid,
  email text,
  user_name text,
  banned_until timestamptz,
  roles text[]
)
language plpgsql
stable
security definer
set search_path = public
as $$
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

comment on function public.list_users_with_roles() is 'Superadmin-only: every user with their email, display name, ban status, and role names. Backs the Roles Management and Account Management pages, which otherwise have no client-side access to auth.users.';

create or replace function public.assign_role(p_user_id uuid, p_role_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role_id uuid;
begin
  if not public.is_superadmin() then
    raise exception 'Only superadmins can assign roles';
  end if;

  if p_role_name not in ('admin', 'superadmin') then
    raise exception 'p_role_name must be ''admin'' or ''superadmin''';
  end if;

  select id into v_role_id from public.roles where role_name = p_role_name;
  if v_role_id is null then
    raise exception 'Unknown role %', p_role_name;
  end if;

  insert into public.user_roles (user_id, role_id)
  values (p_user_id, v_role_id)
  on conflict (user_id, role_id) do nothing;
end;
$$;

comment on function public.assign_role(uuid, text) is 'Superadmin-only: grants the admin or superadmin role to a user. Idempotent -- already holding the role is not an error.';

create or replace function public.revoke_role(p_user_id uuid, p_role_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
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

comment on function public.revoke_role(uuid, text) is 'Superadmin-only: removes the admin or superadmin role from a user. Blocks removing the superadmin role from the last remaining active (non-banned) superadmin.';

revoke all on function public.list_users_with_roles() from public;
revoke all on function public.list_users_with_roles() from anon;
grant execute on function public.list_users_with_roles() to authenticated;

revoke all on function public.assign_role(uuid, text) from public;
revoke all on function public.assign_role(uuid, text) from anon;
grant execute on function public.assign_role(uuid, text) to authenticated;

revoke all on function public.revoke_role(uuid, text) from public;
revoke all on function public.revoke_role(uuid, text) from anon;
grant execute on function public.revoke_role(uuid, text) to authenticated;
