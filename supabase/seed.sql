-- Local development seed data only. Re-applied on every `npx supabase db reset`
-- (see supabase/config.toml [db.seed]). Not for production use.
--
-- Placeholder credentials, change freely -- nothing depends on these outside
-- this file:
--   superadmin@signstack.local / SuperAdmin123!
--   user@signstack.local       / User123!
--
-- Fixed literal UUIDs are used (rather than gen_random_uuid()) so the
-- auth.users / profiles / user_roles rows below can reference each other
-- deterministically within this script:
--   11111111-1111-1111-1111-111111111111 = seed superadmin user
--   22222222-2222-2222-2222-222222222222 = seed generic user

-- 1. Roles --------------------------------------------------------------

insert into public.roles (role_name, role_description)
values
  ('superadmin', 'Full administrative access: can manage roles and role assignments for all users.'),
  ('user', 'Standard authenticated user with access to their own data only.')
on conflict (role_name) do nothing;

-- 2. Auth users -----------------------------------------------------------
-- Columns/values chosen to match the live local auth.users schema
-- (Postgres 17 / gotrue v2.196.0). instance_id
-- '00000000-0000-0000-0000-000000000000' is the standard local/default
-- instance id. email_confirmed_at is set so accounts aren't stuck pending
-- confirmation. confirmation_token/recovery_token/etc are set to '' rather
-- than left null, so they fall outside the partial unique indexes on those
-- columns.

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  is_sso_user,
  is_anonymous
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'superadmin@signstack.local',
    extensions.crypt('SuperAdmin123!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    '',
    false,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'user@signstack.local',
    extensions.crypt('User123!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    '',
    false,
    false
  )
on conflict (id) do nothing;

-- 3. Auth identities --------------------------------------------------------
-- provider_id = the user's own id (as text), matching GoTrue's convention
-- for the 'email' provider. identity_data must contain at least 'sub' and
-- 'email' (identity_data->>'email' backs the generated `email` column).

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    jsonb_build_object(
      'sub', '11111111-1111-1111-1111-111111111111',
      'email', 'superadmin@signstack.local',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    jsonb_build_object(
      'sub', '22222222-2222-2222-2222-222222222222',
      'email', 'user@signstack.local',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  )
on conflict (provider_id, provider) do nothing;

-- 4. Profiles -------------------------------------------------------------

insert into public.profiles (user_id, user_name)
values
  ('11111111-1111-1111-1111-111111111111', 'Super Admin'),
  ('22222222-2222-2222-2222-222222222222', 'Test User')
on conflict (user_id) do nothing;

-- 5. Role assignments -------------------------------------------------------

insert into public.user_roles (user_id, role_id)
select '11111111-1111-1111-1111-111111111111', id
from public.roles
where role_name = 'superadmin'
on conflict (user_id, role_id) do nothing;

insert into public.user_roles (user_id, role_id)
select '22222222-2222-2222-2222-222222222222', id
from public.roles
where role_name = 'user'
on conflict (user_id, role_id) do nothing;
