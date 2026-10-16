-- Only 'admin' was ever inserted via a migration (see
-- 20261011193815_add_admin_role_and_is_admin_function.sql). 'user' and
-- 'superadmin' have only ever existed via supabase/seed.sql, which never
-- runs against hosted staging/production -- so handle_new_user's required
-- 'user' role lookup fails on any real signup to a hosted environment,
-- and there is no way to grant 'superadmin' there either. on conflict do
-- nothing because local dev environments already have these rows from
-- seed.sql and this must not error when re-applied there.

insert into public.roles (role_name, role_description)
values
  ('user', 'Standard authenticated user with access to their own data only.'),
  ('superadmin', 'Full administrative access: can manage roles and role assignments for all users.')
on conflict (role_name) do nothing;
