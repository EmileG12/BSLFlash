-- Full account deletion for the superadmin Account Management page. Unlike
-- ban_user (reversible, blocks sign-in only), this permanently removes the
-- auth.users row. Every table that references user_id (profiles, user_roles,
-- custom_decks, saved_decks, deck_likes) already has "on delete cascade" to
-- auth.users, so deleting the auth.users row alone is sufficient -- no
-- manual cleanup of those tables is needed here.

create or replace function public.delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining_active_superadmins integer;
begin
  if not public.is_superadmin() then
    raise exception 'Only superadmins can delete accounts';
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
      raise exception 'Cannot delete the last remaining active superadmin';
    end if;
  end if;

  delete from auth.users where id = p_user_id;
end;
$$;

comment on function public.delete_user(uuid) is 'Superadmin-only: permanently deletes an account (auth.users row), cascading to profiles, user_roles, custom_decks, saved_decks, and deck_likes via their existing FK constraints. Blocks deleting the last remaining active superadmin. Irreversible, unlike ban_user.';

revoke all on function public.delete_user(uuid) from public;
revoke all on function public.delete_user(uuid) from anon;
grant execute on function public.delete_user(uuid) to authenticated;
