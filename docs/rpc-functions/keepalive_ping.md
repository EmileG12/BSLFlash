# keepalive_ping

**Signature:** `public.keepalive_ping() RETURNS timestamptz`
**Language:** SQL, `STABLE`
**Last touched by migration:** [`20261016140625_create_keepalive_ping_function.sql`](../../supabase/migrations/20261016140625_create_keepalive_ping_function.sql)

**Purpose:** Called by the scheduled [`keepalive-ping.yml`](../../.github/workflows/keepalive-ping.yml) GitHub Actions workflow to stop the staging and production Supabase free-tier projects auto-pausing after 7 days of inactivity.

**Why a system-catalog read, not `select now()` alone:** reading from `pg_catalog.pg_class` makes this a genuine DB read rather than a value Postgres can compute without touching storage — bare health-check pings (hitting a REST endpoint without querying anything) have been reported not to reliably prevent the pause. Reading from a catalog table rather than an app table also means this function can't break if application tables are renamed or dropped.

Callable anonymously; has no app-level effect and is not used anywhere in the frontend.

## Grants

- `EXECUTE` revoked from `PUBLIC`; granted to `anon`.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE OR REPLACE FUNCTION "public"."keepalive_ping"() RETURNS timestamp with time zone
    LANGUAGE "sql" STABLE
    AS $$
  select now() from pg_catalog.pg_class limit 1;
$$;

COMMENT ON FUNCTION "public"."keepalive_ping"() IS 'Performs a trivial system-catalog read so a scheduled external ping counts as genuine DB activity, preventing the free-tier 7-day auto-pause. Callable anonymously; has no app-level effect.';

REVOKE ALL ON FUNCTION "public"."keepalive_ping"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."keepalive_ping"() TO "anon";
GRANT ALL ON FUNCTION "public"."keepalive_ping"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."keepalive_ping"() TO "service_role";
```
