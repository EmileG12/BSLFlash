# assign_role

**Signature:** `public.assign_role(p_user_id uuid, p_role_name text) RETURNS void`
**Language:** PL/pgSQL, `SECURITY DEFINER`, `SET search_path = public`
**Last touched by migration:** [`20261011194007_create_role_management_functions.sql`](../../supabase/migrations/20261011194007_create_role_management_functions.sql)

**Purpose:** Grants the `admin` or `superadmin` role to a user. Called from the [Roles](../components/SuperadminRolesPage.md) page. Idempotent: granting a role the user already holds is not an error (`on conflict do nothing`).

Only `admin` and `superadmin` are accepted. `user` is granted automatically by [`handle_new_user`](./handle_new_user.md) and is not meant to be managed by hand, so it is rejected here.

Re-checks [`is_superadmin()`](./is_superadmin.md) itself, same reasoning as [`list_users_with_roles`](./list_users_with_roles.md).

## Grants

- `EXECUTE` revoked from `PUBLIC` and `anon`; granted to `authenticated`.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE OR REPLACE FUNCTION "public"."assign_role"("p_user_id" "uuid", "p_role_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_role_id uuid;
begin
  if not public.is_superadmin() then
    raise exception 'Only superadmins can assign roles';
  end if;

  if p_role_name not in ('admin', 'superadmin') then
    raise exception 'p_role_name must be ''admin'' or ''superadmin''';
  end if;

  select id into v_role_id from public.roles where role_name = p_role_name;
  if v_role_id is null then
    raise exception 'Unknown role %', p_role_name;
  end if;

  insert into public.user_roles (user_id, role_id)
  values (p_user_id, v_role_id)
  on conflict (user_id, role_id) do nothing;
end;
$$;

COMMENT ON FUNCTION "public"."assign_role"("p_user_id" "uuid", "p_role_name" "text") IS 'Superadmin-only: grants the admin or superadmin role to a user. Idempotent -- already holding the role is not an error.';

REVOKE ALL ON FUNCTION "public"."assign_role"("p_user_id" "uuid", "p_role_name" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."assign_role"("p_user_id" "uuid", "p_role_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_role"("p_user_id" "uuid", "p_role_name" "text") TO "service_role";
```
