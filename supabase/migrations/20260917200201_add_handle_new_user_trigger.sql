-- On every new auth.users row (via supabase.auth.signUp() or a direct
-- INSERT such as supabase/seed.sql), automatically create the matching
-- public.profiles row and grant the base 'user' role -- atomically, in the
-- same transaction as the auth.users insert.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text := new.raw_user_meta_data ->> 'username';
  v_user_role_id uuid;
begin
  if v_username is null or btrim(v_username) = '' then
    raise exception 'raw_user_meta_data.username is required to create a profile for user %', new.id
      using errcode = 'not_null_violation';
  end if;

  begin
    insert into public.profiles (user_id, user_name) values (new.id, v_username);
  exception when unique_violation then
    raise exception 'username "%" is already taken', v_username using errcode = 'unique_violation';
  end;

  select id into v_user_role_id from public.roles where role_name = 'user';
  if v_user_role_id is null then
    raise exception 'roles table has no ''user'' role -- cannot assign default role to new user %', new.id;
  end if;

  insert into public.user_roles (user_id, role_id) values (new.id, v_user_role_id);

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'AFTER INSERT trigger on auth.users: creates the matching public.profiles row (user_name from raw_user_meta_data->>''username'') and grants the base ''user'' role, atomically with the auth.users insert.';

-- Trigger-only function, never meant to be called directly via RPC (unlike
-- is_superadmin()). Revoke EXECUTE from everything -- the trigger mechanism
-- invokes it regardless of the firing role's own grants.
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
