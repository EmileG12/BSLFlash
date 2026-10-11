-- Atomically swaps which variant is primary for a word, for the superadmin
-- Manage Words page. Runs as the caller (not SECURITY DEFINER) -- superadmin
-- already has direct UPDATE rights on signs via signs_update_superadmin, so
-- this only needs to exist for atomicity (un-set then set in one
-- transaction, avoiding a moment where a word has zero or two primaries if
-- the two steps were issued as separate client requests), plus a clearer
-- error than RLS's silent zero-rows-updated on a non-superadmin.

create or replace function public.set_primary_sign(p_sign_id uuid)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_word_id uuid;
begin
  if not public.is_superadmin() then
    raise exception 'Only superadmins can change a word''s primary variant';
  end if;

  select word_id into v_word_id from public.signs where id = p_sign_id;
  if v_word_id is null then
    raise exception 'Unknown sign %', p_sign_id;
  end if;

  update public.signs set is_primary = false
  where word_id = v_word_id and id <> p_sign_id and is_primary;

  update public.signs set is_primary = true where id = p_sign_id;
end;
$$;

comment on function public.set_primary_sign(uuid) is 'Superadmin-only: makes the given sign the primary variant for its word, un-setting any other primary variant of that word in the same transaction.';

revoke all on function public.set_primary_sign(uuid) from public;
revoke all on function public.set_primary_sign(uuid) from anon;
grant execute on function public.set_primary_sign(uuid) to authenticated;
