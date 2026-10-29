-- Admin page's "Edit categories" draft/save flow (AdminPage.tsx) used to send
-- the add/remove delta as two separate client-side requests: a delete(), then
-- an insert(). If the delete committed and the insert then failed (a
-- transient network/RLS error), the database silently ended up with fewer
-- categories than before, while the component's "saved" state still believed
-- the deleted category was present -- a real, not-contrived, partial-failure
-- data loss path (per diff review on 2026-10-29).
--
-- This replaces both calls with one RPC that computes the add/remove delta
-- itself and performs it as a single statement pair inside one Postgres
-- function body/transaction: either both the delete and the insert apply, or
-- an exception rolls back both and nothing changes. No Storage involvement,
-- so unlike add_word_with_video there's no separate client-side cleanup step.
--
-- No SECURITY DEFINER and no manual role checks: runs with the caller's own
-- rights, so the existing word_categories insert/delete RLS policies
-- (admin-or-superadmin, per 20261011193831_allow_admin_insert_on_word_content_tables.sql)
-- apply exactly as if the client had issued the delete/insert directly.

create or replace function public.set_word_categories(
  p_word_id uuid,
  p_category_ids uuid[]
)
returns void
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from public.words where id = p_word_id) then
    raise exception 'set_word_categories: word % does not exist', p_word_id;
  end if;

  delete from public.word_categories
  where word_id = p_word_id
    and category_id not in (select unnest(p_category_ids));

  insert into public.word_categories (word_id, category_id)
  select distinct p_word_id, category_id
  from unnest(p_category_ids) as category_id
  where category_id not in (
    select category_id from public.word_categories where word_id = p_word_id
  );
end;
$$;

comment on function public.set_word_categories(uuid, uuid[]) is
  'Admin/superadmin-only (enforced by RLS on each insert/delete): replaces the full set of category tags on a word with p_category_ids in one transaction, computing the add/remove delta itself so a partial failure cannot leave the word with a category set the caller never asked for. p_category_ids may be empty (untag every category) but not null.';

revoke all on function public.set_word_categories(uuid, uuid[]) from public;
revoke all on function public.set_word_categories(uuid, uuid[]) from anon;
grant execute on function public.set_word_categories(uuid, uuid[]) to authenticated;
