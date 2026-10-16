-- Called by a scheduled GitHub Actions workflow to keep free-tier Supabase
-- projects (staging and production) from auto-pausing after 7 days of
-- inactivity. Reads from a system catalog rather than an app table so it
-- can't break if application tables change shape, and performs a genuine
-- read (not a no-op computed value) since bare health-check pings have been
-- reported not to reliably prevent the pause.

create or replace function public.keepalive_ping()
returns timestamptz
language sql
stable
as $$
  select now() from pg_catalog.pg_class limit 1;
$$;

comment on function public.keepalive_ping() is 'Performs a trivial system-catalog read so a scheduled external ping counts as genuine DB activity, preventing the free-tier 7-day auto-pause. Callable anonymously; has no app-level effect.';

revoke all on function public.keepalive_ping() from public;
grant execute on function public.keepalive_ping() to anon;
