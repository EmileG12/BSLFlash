-- Adds the 'admin' role (distinct from 'superadmin') and the is_admin()
-- helper, same pattern as is_superadmin() in 20260917005233. Admin is a
-- separate role, not a superset in the data model -- callers that want
-- "admin or superadmin" compose both checks explicitly (OR), since
-- superadmin's extra powers are granted by giving superadmins is_superadmin()
-- checks on top, not by also assigning them the admin role.

insert into public.roles (role_name, role_description)
values ('admin', 'Can add new words (with their first sign variant and video) and manage which existing categories a word belongs to.')
on conflict (role_name) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.role_name = 'admin'
  );
$$;

comment on function public.is_admin() is
  'Returns whether the current auth.uid() holds the admin role. Used inside RLS policies; also directly callable via RPC. Does not return true for superadmins -- callers wanting "admin or superadmin" must check both.';

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;
