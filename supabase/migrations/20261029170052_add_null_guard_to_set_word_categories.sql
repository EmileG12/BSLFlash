-- Diff review of 20261029161052_set_word_categories_atomically.sql found that
-- a NULL element in p_category_ids was never rejected, and the delete/insert
-- branches handle it inconsistently: `category_id NOT IN (list containing
-- NULL)` is NULL (not TRUE) per three-valued logic, so the delete branch
-- would silently skip rows it should have removed, while the insert branch
-- would instead hit a NOT NULL/FK violation and raise. Currently unreachable
-- from the only caller (AdminPage.tsx only ever builds the array from real
-- category ids already in the database), but adding an explicit, descriptive
-- guard turns a hypothetical future silent no-op into a loud, specific error
-- instead of relying on that caller invariant to hold forever.

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

  if exists (select 1 from unnest(p_category_ids) as category_id where category_id is null) then
    raise exception 'set_word_categories: p_category_ids must not contain null elements';
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
  'Admin/superadmin-only (enforced by RLS on each insert/delete): replaces the full set of category tags on a word with p_category_ids in one transaction, computing the add/remove delta itself so a partial failure cannot leave the word with a category set the caller never asked for. p_category_ids may be empty (untag every category) but must not be null or contain null elements.';
