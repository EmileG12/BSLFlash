# delete_user

**Signature:** `public.delete_user(p_user_id uuid) RETURNS void`
**Language:** PL/pgSQL, `SECURITY DEFINER`, `SET search_path = public`
**Last touched by migration:** [`20261015173827_create_delete_user_function.sql`](../../supabase/migrations/20261015173827_create_delete_user_function.sql)

**Purpose:** Permanently deletes an account by deleting its `auth.users` row. Called from the [Accounts](../components/SuperadminAccountsPage.md) page behind a confirming dialog.

**Why deleting `auth.users` is sufficient:** `profiles`, `user_roles`, `custom_decks`, `saved_decks`, and `deck_likes` all reference `auth.users` with `ON DELETE CASCADE`, so the function does not delete from those tables by hand.

**Why a plain SQL RPC, not an Edge Function:** the repo has no `supabase/functions/` yet, and this stays consistent with the other admin-action RPCs. Edge Functions are deferred until something requires leaving the database.

**Last-superadmin guard:** deleting a superadmin is refused if no other active superadmin would remain. "Active" means not banned, the same definition as [`ban_user`](./ban_user.md). The guard is re-implemented inline here rather than shared, matching how [`ban_user`](./ban_user.md) and [`revoke_role`](./revoke_role.md) each carry their own copy.

Irreversible. Unlike [`ban_user`](./ban_user.md), there is no undo.

Re-checks [`is_superadmin()`](./is_superadmin.md) itself.

## Grants

- `EXECUTE` revoked from `PUBLIC` and `anon`; granted to `authenticated`.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE OR REPLACE FUNCTION "public"."delete_user"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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

COMMENT ON FUNCTION "public"."delete_user"("p_user_id" "uuid") IS 'Superadmin-only: permanently deletes an account (auth.users row), cascading to profiles, user_roles, custom_decks, saved_decks, and deck_likes via their existing FK constraints. Blocks deleting the last remaining active superadmin. Irreversible, unlike ban_user.';

REVOKE ALL ON FUNCTION "public"."delete_user"("p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."delete_user"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user"("p_user_id" "uuid") TO "service_role";
```
