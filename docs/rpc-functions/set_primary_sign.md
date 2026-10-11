# set_primary_sign

**Signature:** `public.set_primary_sign(p_sign_id uuid) RETURNS void`
**Language:** PL/pgSQL, `SET search_path = public` (not `SECURITY DEFINER`)
**Last touched by migration:** [`20261011194048_create_set_primary_sign_function.sql`](../../supabase/migrations/20261011194048_create_set_primary_sign_function.sql)

**Purpose:** Makes one sign the primary variant for its word, un-setting any other primary variant of that word. Called from the Star toggle on [SuperadminWordEditPage](../components/SuperadminWordEditPage.md).

**Why it exists at all:** [`signs_one_primary_per_word`](../db-schema/signs.md) allows at most one primary per word. Flipping the flag takes two writes (unset the old, set the new). Issued as two separate client requests there would be a moment with zero or two primaries, so both writes run in one function call and one transaction.

**Why not `SECURITY DEFINER`:** the caller is already a superadmin with direct UPDATE rights on `signs` through [`signs_update_superadmin`](../rls-policies/signs/README.md). The function does not need elevated rights; it runs as the caller.

**Why a superadmin check at all, if RLS already gates UPDATE:** RLS would make a non-superadmin's update a silent zero-rows-updated. The explicit check raises a clear error instead.

## Grants

- `EXECUTE` revoked from `PUBLIC` and `anon`; granted to `authenticated`.

## Current definition

*Derived from the migration; to be confirmed against `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION public.set_primary_sign(p_sign_id uuid)
RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
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

COMMENT ON FUNCTION public.set_primary_sign(uuid) IS 'Superadmin-only: makes the given sign the primary variant for its word, un-setting any other primary variant of that word in the same transaction.';

REVOKE ALL ON FUNCTION public.set_primary_sign(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_primary_sign(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_primary_sign(uuid) TO authenticated;
```
