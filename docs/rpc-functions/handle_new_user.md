# handle_new_user

**Invocation: trigger-only, not RPC-callable.** Unlike [`is_superadmin()`](./is_superadmin.md), this function is never meant to be invoked directly by client code (`EXECUTE` is revoked from every role, including `authenticated`) — it only ever runs automatically, fired by Postgres itself whenever a row is inserted into `auth.users`.

**Signature:** `public.handle_new_user() RETURNS trigger`
**Language:** PL/pgSQL, `SECURITY DEFINER`, `SET search_path = public`
**Trigger:** `on_auth_user_created` — `AFTER INSERT ON auth.users FOR EACH ROW`
**Last touched by migration:** [`20260917200201_add_handle_new_user_trigger.sql`](../../supabase/migrations/20260917200201_add_handle_new_user_trigger.sql)

**Purpose:** Whenever a new `auth.users` row is created — whether via a real signup (`supabase.auth.signUp()`, see [signUp](../utils/auth.md)) or a direct `INSERT` such as `supabase/seed.sql` — this automatically creates the matching [`profiles`](../db-schema/profiles.md) row and grants the base `'user'` role via [`user_roles`](../db-schema/user_roles.md), atomically, in the same transaction as the `auth.users` insert. There is never a window where an auth account exists without a profile/role.

**How it gets the username:** `supabase.auth.signUp({ email, password, options: { data: { username } } })` causes GoTrue to store `{"username": "..."}` verbatim in the new row's `raw_user_meta_data` JSONB column. The trigger reads it back out with `new.raw_user_meta_data ->> 'username'` (`new` is the row that was just inserted, automatically populated by Postgres for any row-level trigger; `->>` extracts a JSON object key as `text`).

**Failure behavior (fails loudly, no fallback):**
- Missing/blank `username` → `raise exception ... using errcode = 'not_null_violation'` (SQLSTATE `23502`). Unreachable through the app's own signup form, which always validates a non-empty username first.
- Duplicate `username` (violates `profiles.profiles_user_name_key`) → caught and re-raised as `raise exception ... using errcode = 'unique_violation'` (SQLSTATE `23505`).
- Either way, raising an exception inside the trigger rolls back the entire enclosing transaction, including the `auth.users` insert that fired it — no orphaned/partial account is ever left behind.
- **Verified against the live local Auth API:** GoTrue reports *both* of these trigger-raised failures identically to the client — a generic `500` `AuthRetryableFetchError` with `error.code` `undefined` and `error.message` `'Database error saving new user'`. They are not distinguishable from each other on the client (only from GoTrue's own, separately-identifiable `user_already_exists` duplicate-email error). See [signUp](../utils/auth.md) for how this is handled.

**Why no extra `GRANT`s are needed:** GoTrue connects as `supabase_auth_admin`, which has zero privileges on `public.profiles`/`public.user_roles`. Because this function is `SECURITY DEFINER`, it runs with the *function owner's* (`postgres`) privileges regardless of who fired the triggering `INSERT`, and `postgres` owns both target tables outright — the same mechanism [`is_superadmin()`](./is_superadmin.md) already relies on, for the reverse problem (an RLS policy reading `user_roles` without recursing through the caller's own RLS).

## Current definition

*From `npx supabase db dump --local --schema public`, plus a direct `pg_get_triggerdef()` query for the trigger registration itself (the dump only covers the `public` schema; the trigger is registered on `auth.users`, in the `auth` schema):*

```sql
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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

COMMENT ON FUNCTION "public"."handle_new_user"() IS 'AFTER INSERT trigger on auth.users: creates the matching public.profiles row (user_name from raw_user_meta_data->>''username'') and grants the base ''user'' role, atomically with the auth.users insert.';

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";
```

Trigger registration (`pg_get_triggerdef`):
```sql
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Fires on:** any `INSERT` into `auth.users` — real signups via [`signUp`](../utils/auth.md), and `supabase/seed.sql`'s direct inserts (which set `raw_user_meta_data` accordingly so seeded accounts get real usernames/roles too, exercising the same code path as production signups).
