-- RBAC: roles, profiles, and user_roles tables, plus the is_superadmin() helper
-- and RLS policies enforcing "only superadmin writes roles/user_roles; users can
-- read their own role assignment and their own profile".

-- 1. Tables -------------------------------------------------------------

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  role_name text not null unique,
  role_description text
);

comment on table public.roles is 'Lookup table of roles available in the app (e.g. superadmin, user).';

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  user_name text
);

comment on table public.profiles is 'One row per auth user, holding app-facing profile data.';

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete restrict,
  unique (user_id, role_id)
);

comment on table public.user_roles is 'Junction table assigning roles to auth users.';

create index user_roles_role_id_idx on public.user_roles (role_id);

-- 2. is_superadmin() helper ----------------------------------------------
-- SECURITY DEFINER runs as the function owner (bypasses RLS on user_roles/
-- roles for the lookup inside it), which is what avoids infinite recursion
-- when this function is itself used inside a user_roles/roles/profiles policy.

create or replace function public.is_superadmin()
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
      and r.role_name = 'superadmin'
  );
$$;

comment on function public.is_superadmin() is
  'Returns whether the current auth.uid() holds the superadmin role. Used inside RLS policies; also directly callable via RPC.';

-- Newly created functions here default to EXECUTE granted directly to
-- anon/authenticated/service_role (confirmed via pg_default_acl) -- revoking
-- from PUBLIC alone is not enough to lock anon out.
revoke all on function public.is_superadmin() from public;
revoke all on function public.is_superadmin() from anon;
grant execute on function public.is_superadmin() to authenticated;

-- 3. Enable RLS -----------------------------------------------------------

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

-- 4. Policies: roles --------------------------------------------------------

create policy roles_select_authenticated
  on public.roles for select to authenticated
  using (true);

create policy roles_insert_superadmin
  on public.roles for insert to authenticated
  with check (public.is_superadmin());

create policy roles_update_superadmin
  on public.roles for update to authenticated
  using (public.is_superadmin()) with check (public.is_superadmin());

create policy roles_delete_superadmin
  on public.roles for delete to authenticated
  using (public.is_superadmin());

-- 5. Policies: user_roles ----------------------------------------------------

create policy user_roles_select_own_or_superadmin
  on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_superadmin());

create policy user_roles_insert_superadmin
  on public.user_roles for insert to authenticated
  with check (public.is_superadmin());

create policy user_roles_update_superadmin
  on public.user_roles for update to authenticated
  using (public.is_superadmin()) with check (public.is_superadmin());

create policy user_roles_delete_superadmin
  on public.user_roles for delete to authenticated
  using (public.is_superadmin());

-- 6. Policies: profiles (confirmed default) ----------------------------------

create policy profiles_select_own_or_superadmin
  on public.profiles for select to authenticated
  using (user_id = auth.uid() or public.is_superadmin());

create policy profiles_insert_own_or_superadmin
  on public.profiles for insert to authenticated
  with check (user_id = auth.uid() or public.is_superadmin());

create policy profiles_update_own_or_superadmin
  on public.profiles for update to authenticated
  using (user_id = auth.uid() or public.is_superadmin())
  with check (user_id = auth.uid() or public.is_superadmin());

create policy profiles_delete_own_or_superadmin
  on public.profiles for delete to authenticated
  using (user_id = auth.uid() or public.is_superadmin());
