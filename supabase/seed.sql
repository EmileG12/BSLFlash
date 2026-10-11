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
    '{"username":"Super Admin"}'::jsonb,
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
    '{"username":"Test User"}'::jsonb,
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

-- 4. Role assignments -------------------------------------------------------
-- public.profiles rows and the base 'user' role are both created
-- automatically by the handle_new_user trigger, fired by the auth.users
-- insert above (now that raw_user_meta_data.username is populated). The
-- superadmin account additionally needs the 'superadmin' role, which the
-- trigger never grants (it only ever grants 'user').

insert into public.user_roles (user_id, role_id)
select '11111111-1111-1111-1111-111111111111', id
from public.roles
where role_name = 'superadmin'
on conflict (user_id, role_id) do nothing;

-- 5. Flashcard sample content -------------------------------------------
-- Fixed literal UUIDs, same rationale as the auth users above: lets the
-- sign_videos rows inserted by scripts/seed-sign-videos.mjs reference these
-- signs deterministically after this script has run.
--   aaaaaaaa-... = "Greetings" category
--   bbbbbbbb-... = "Hello" word / sign
--   cccccccc-... = "World" word / sign

insert into public.categories (id, category_name)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Greetings')
on conflict (id) do nothing;

insert into public.words (id, word, definition)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hello', 'A greeting used when meeting someone or answering the phone.'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'World', 'The earth, together with all of its countries and peoples.')
on conflict (id) do nothing;

insert into public.word_categories (word_id, category_id)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
on conflict (word_id, category_id) do nothing;

insert into public.signs (id, word_id, variant_name, region, is_primary)
values
  ('bbbbbbbb-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Standard', null, true),
  ('cccccccc-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Standard', null, true)
on conflict (id) do nothing;

-- 6. Colours / Time topic categories + GCSE vocabulary category ---------
-- Colours and Time are topic categories like Greetings (is_vocabulary
-- defaults to false). GCSE is a vocabulary-requirement category
-- (is_vocabulary = true) rather than a topic -- every new word below
-- belongs to both its topic category AND GCSE, since "which topics exist"
-- and "which words a qualification requires" are independent groupings
-- over the same words. Fixed literal UUIDs again, for the same reason as
-- above: scripts/seed-sign-videos.mjs references these signs
-- deterministically.

insert into public.categories (id, category_name, is_vocabulary)
values
  ('a97d17e3-1689-4d7c-b200-24f9e3681e9e', 'Colours', false),
  ('bb331798-cc6f-491d-b240-9330be1b56ec', 'Time', false),
  ('3ea15bef-5166-4c26-86fc-b3e7ed006087', 'GCSE', true)
on conflict (id) do nothing;

insert into public.words (id, word, definition)
values
  ('f291ab46-e2fc-4b38-a332-01747c244803', 'Colour', 'The property of an object or light that is perceived by the eye, such as red, blue, or green.'),
  ('403d0d6a-e0b3-40fb-a7f2-db6191f80dea', 'Black', 'The darkest colour, resulting from the absence or complete absorption of light.'),
  ('62f17de7-0450-4520-a9d2-e7cae56481a6', 'Blue', 'The colour of a clear sky or the deep sea, between green and violet on the visible spectrum.'),
  ('21e51549-31ec-4303-9c6f-ff162047ebcd', 'Brown', 'A colour produced by mixing red, yellow, and black, resembling soil or wood.'),
  ('3c501c6d-06f1-460b-9176-d6efffcc7a3e', 'Green', 'The colour between blue and yellow on the visible spectrum, as of grass or leaves.'),
  ('4576b884-cf78-4bce-9f21-ab0d4a98fce9', 'Grey', 'A colour made by mixing black and white, like the colour of ash or storm clouds.'),
  ('5b2f3bea-8284-41a1-a239-f480960c8f9d', 'White', 'The colour of milk or fresh snow, produced by the reflection of all visible light.'),
  ('dd6c5ae5-04cb-476d-aa45-ea00940a05ba', 'Monday', 'The day of the week after Sunday and before Tuesday.'),
  ('7d573786-25ac-47f0-8273-24a8e2143216', 'Tuesday', 'The day of the week after Monday and before Wednesday.'),
  ('1b388fe0-1330-4d0d-8f32-66022b139aad', 'Wednesday', 'The day of the week after Tuesday and before Thursday.'),
  ('cfff5dad-5443-4beb-8537-e56fc6f35539', 'Thursday', 'The day of the week after Wednesday and before Friday.'),
  ('677547cc-83ca-4d24-9e4f-4982cebed9a1', 'Friday', 'The day of the week after Thursday and before Saturday.'),
  ('99454a6d-d55c-442d-9da8-938a06c4ac2f', 'Saturday', 'The day of the week after Friday and before Sunday.'),
  ('93a87f35-1760-452d-9923-a045da046eac', 'Sunday', 'The day of the week after Saturday and before Monday.')
on conflict (id) do nothing;

insert into public.word_categories (word_id, category_id)
values
  -- Colours topic
  ('f291ab46-e2fc-4b38-a332-01747c244803', 'a97d17e3-1689-4d7c-b200-24f9e3681e9e'),
  ('403d0d6a-e0b3-40fb-a7f2-db6191f80dea', 'a97d17e3-1689-4d7c-b200-24f9e3681e9e'),
  ('62f17de7-0450-4520-a9d2-e7cae56481a6', 'a97d17e3-1689-4d7c-b200-24f9e3681e9e'),
  ('21e51549-31ec-4303-9c6f-ff162047ebcd', 'a97d17e3-1689-4d7c-b200-24f9e3681e9e'),
  ('3c501c6d-06f1-460b-9176-d6efffcc7a3e', 'a97d17e3-1689-4d7c-b200-24f9e3681e9e'),
  ('4576b884-cf78-4bce-9f21-ab0d4a98fce9', 'a97d17e3-1689-4d7c-b200-24f9e3681e9e'),
  ('5b2f3bea-8284-41a1-a239-f480960c8f9d', 'a97d17e3-1689-4d7c-b200-24f9e3681e9e'),
  -- Time topic
  ('dd6c5ae5-04cb-476d-aa45-ea00940a05ba', 'bb331798-cc6f-491d-b240-9330be1b56ec'),
  ('7d573786-25ac-47f0-8273-24a8e2143216', 'bb331798-cc6f-491d-b240-9330be1b56ec'),
  ('1b388fe0-1330-4d0d-8f32-66022b139aad', 'bb331798-cc6f-491d-b240-9330be1b56ec'),
  ('cfff5dad-5443-4beb-8537-e56fc6f35539', 'bb331798-cc6f-491d-b240-9330be1b56ec'),
  ('677547cc-83ca-4d24-9e4f-4982cebed9a1', 'bb331798-cc6f-491d-b240-9330be1b56ec'),
  ('99454a6d-d55c-442d-9da8-938a06c4ac2f', 'bb331798-cc6f-491d-b240-9330be1b56ec'),
  ('93a87f35-1760-452d-9923-a045da046eac', 'bb331798-cc6f-491d-b240-9330be1b56ec'),
  -- GCSE vocabulary (every new word above also belongs here)
  ('f291ab46-e2fc-4b38-a332-01747c244803', '3ea15bef-5166-4c26-86fc-b3e7ed006087'),
  ('403d0d6a-e0b3-40fb-a7f2-db6191f80dea', '3ea15bef-5166-4c26-86fc-b3e7ed006087'),
  ('62f17de7-0450-4520-a9d2-e7cae56481a6', '3ea15bef-5166-4c26-86fc-b3e7ed006087'),
  ('21e51549-31ec-4303-9c6f-ff162047ebcd', '3ea15bef-5166-4c26-86fc-b3e7ed006087'),
  ('3c501c6d-06f1-460b-9176-d6efffcc7a3e', '3ea15bef-5166-4c26-86fc-b3e7ed006087'),
  ('4576b884-cf78-4bce-9f21-ab0d4a98fce9', '3ea15bef-5166-4c26-86fc-b3e7ed006087'),
  ('5b2f3bea-8284-41a1-a239-f480960c8f9d', '3ea15bef-5166-4c26-86fc-b3e7ed006087'),
  ('dd6c5ae5-04cb-476d-aa45-ea00940a05ba', '3ea15bef-5166-4c26-86fc-b3e7ed006087'),
  ('7d573786-25ac-47f0-8273-24a8e2143216', '3ea15bef-5166-4c26-86fc-b3e7ed006087'),
  ('1b388fe0-1330-4d0d-8f32-66022b139aad', '3ea15bef-5166-4c26-86fc-b3e7ed006087'),
  ('cfff5dad-5443-4beb-8537-e56fc6f35539', '3ea15bef-5166-4c26-86fc-b3e7ed006087'),
  ('677547cc-83ca-4d24-9e4f-4982cebed9a1', '3ea15bef-5166-4c26-86fc-b3e7ed006087'),
  ('99454a6d-d55c-442d-9da8-938a06c4ac2f', '3ea15bef-5166-4c26-86fc-b3e7ed006087'),
  ('93a87f35-1760-452d-9923-a045da046eac', '3ea15bef-5166-4c26-86fc-b3e7ed006087')
on conflict (word_id, category_id) do nothing;

insert into public.signs (id, word_id, variant_name, region, is_primary)
values
  ('7ff0b84c-0e37-4686-8bc7-d37276aada13', 'f291ab46-e2fc-4b38-a332-01747c244803', 'Standard', null, true),
  ('b2da2501-f611-4e2f-b0bd-d3fa16dadf0c', '403d0d6a-e0b3-40fb-a7f2-db6191f80dea', 'Standard', null, true),
  ('d99478b8-4ed6-491b-80e2-32a4811c36e1', '62f17de7-0450-4520-a9d2-e7cae56481a6', 'Standard', null, true),
  ('4bc7eedb-a642-49b0-9929-554ca3271edb', '21e51549-31ec-4303-9c6f-ff162047ebcd', 'Standard', null, true),
  ('ec3febcf-2d9c-43bb-b780-610aa78ecc1e', '3c501c6d-06f1-460b-9176-d6efffcc7a3e', 'Standard', null, true),
  ('c75b4e3d-f7d5-4837-b890-f5c7e902077b', '4576b884-cf78-4bce-9f21-ab0d4a98fce9', 'Standard', null, true),
  ('4df58e8c-d3be-4ac8-8012-484f99970ed3', '5b2f3bea-8284-41a1-a239-f480960c8f9d', 'Standard', null, true),
  ('42cb71b7-50c6-4708-b6fe-a68e78407672', 'dd6c5ae5-04cb-476d-aa45-ea00940a05ba', 'Standard', null, true),
  ('87e58fdf-cdda-443f-83a0-d90c74399ceb', '7d573786-25ac-47f0-8273-24a8e2143216', 'Standard', null, true),
  ('e5cbd071-8fec-4902-8e62-5ef179d0fbcc', '1b388fe0-1330-4d0d-8f32-66022b139aad', 'Standard', null, true),
  ('1ebecb8e-0dae-4b29-a39f-a1cc52fb423e', 'cfff5dad-5443-4beb-8537-e56fc6f35539', 'Standard', null, true),
  ('3c94953c-96d4-4a9a-8cd5-2a22185cfc3c', '677547cc-83ca-4d24-9e4f-4982cebed9a1', 'Standard', null, true),
  ('bd33fcdc-2b55-469d-9db1-31e53e6ceb8b', '99454a6d-d55c-442d-9da8-938a06c4ac2f', 'Standard', null, true),
  ('3b8ad2e6-25e8-4001-8828-41981f4c5598', '93a87f35-1760-452d-9923-a045da046eac', 'Standard', null, true)
on conflict (id) do nothing;
