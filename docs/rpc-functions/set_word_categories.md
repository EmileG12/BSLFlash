# set_word_categories

**Signature:** `public.set_word_categories(p_word_id uuid, p_category_ids uuid[]) RETURNS void`
**Language:** PL/pgSQL, `SET search_path = public` (not `SECURITY DEFINER`)
**Created by migration:** [`20261029161052_set_word_categories_atomically.sql`](../../supabase/migrations/20261029161052_set_word_categories_atomically.sql)

**Purpose:** Replaces the full set of category tags on a word with `p_category_ids`, in one transaction. Called by [AdminPage](../components/AdminPage.md)'s "Save edit" button in the "Edit categories" panel.

**Why it exists:** the client previously computed the add/remove delta itself and sent it as two separate requests -- a `delete()` then an `insert()` on `word_categories`. If the delete committed and the insert then failed, the database ended up with fewer categories than before while the client's "last saved" state still believed the deleted category was present -- a real partial-failure data-loss path, not a contrived one. This function moves the delta computation and both statements inside a single Postgres function body, so either the whole replacement applies or an exception rolls back everything and nothing changes.

**Delta computation:** deletes any existing `word_categories` row for `p_word_id` whose `category_id` is not in `p_category_ids`, then inserts any id in `p_category_ids` not already present (post-delete) -- `select distinct` guards against the caller passing duplicate ids in the array. `p_category_ids` may be `'{}'` (untag every category) but not `NULL`.

**Error granularity:** raises an explicit `'set_word_categories: word % does not exist'` (naming the word id) if `p_word_id` doesn't match any row in `words`, rather than letting an invalid id fall through to a less specific foreign-key-violation error from the insert.

**Why not `SECURITY DEFINER`:** the function runs as the caller, so the existing `word_categories_insert_admin_or_superadmin` / `word_categories_delete_admin_or_superadmin` policies apply to each statement exactly as if the client had issued them directly. See [word_categories](../rls-policies/word_categories/README.md).

**No Storage involvement:** unlike `add_word_with_video`/`add_variant_with_video`/`add_video_to_sign`, this only touches `word_categories`, so there's no client-side upload/cleanup step to pair with it.

## Grants

- `EXECUTE` revoked from `PUBLIC` and `anon`; granted to `authenticated`.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE OR REPLACE FUNCTION "public"."set_word_categories"("p_word_id" "uuid", "p_category_ids" "uuid"[]) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
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

COMMENT ON FUNCTION "public"."set_word_categories"("p_word_id" "uuid", "p_category_ids" "uuid"[]) IS 'Admin/superadmin-only (enforced by RLS on each insert/delete): replaces the full set of category tags on a word with p_category_ids in one transaction, computing the add/remove delta itself so a partial failure cannot leave the word with a category set the caller never asked for. p_category_ids may be empty (untag every category) but not null.';

REVOKE ALL ON FUNCTION "public"."set_word_categories"("p_word_id" "uuid", "p_category_ids" "uuid"[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."set_word_categories"("p_word_id" "uuid", "p_category_ids" "uuid"[]) FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."set_word_categories"("p_word_id" "uuid", "p_category_ids" "uuid"[]) TO "authenticated";
```
