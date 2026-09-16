# Migrations workflow

`supabase/migrations/` is the git-tracked source of truth for schema changes, RLS policies, and RPC functions. Migrations are applied to the local Postgres instance running in Docker.

## Creating a migration

```
npx supabase migration new <snake_case_description>
```

This writes an empty file at `supabase/migrations/<timestamp>_<snake_case_description>.sql` — write the SQL for the change in it.

One migration = one logical change. Don't batch unrelated schema changes into a single migration file.

## Applying migrations locally

```
npx supabase db reset
```

Rebuilds the local database from scratch, applying every migration in `supabase/migrations/` in order (plus `supabase/seed.sql` if present). Use this after pulling new migrations or when you want a clean state.

```
npx supabase migration up
```

Applies only migrations that haven't been applied to the local database yet, without a full reset.

Migrations are forward-only — the Supabase CLI doesn't generate down-migrations by default, and this project doesn't have a rollback convention. To undo a change, write a new migration that reverses it.

## Keeping `/docs` in sync

After applying a migration that touches a table, RLS policy, or RPC function:

1. Dump the current schema from the live local database:
   ```
   npx supabase db dump --local --schema public -f <scratch-file>.sql
   ```
2. Find the exact current `CREATE TABLE` / `CREATE POLICY` / `CREATE FUNCTION` block for whatever changed, and copy it verbatim into the matching file under [docs/db-schema/](./db-schema/README.md), [docs/rls-policies/](./rls-policies/README.md), or [docs/rpc-functions/](./rpc-functions/README.md).
3. Delete the scratch dump file — don't commit a redundant full schema dump; each entity's doc file holds its own current-state excerpt.
4. Link the doc entry's "Last touched by migration" line to the new migration file.

This dump-and-extract step matters because a table/policy/function's current shape is the *cumulative* result of every migration applied to it — a later migration can `ALTER`, `DROP`+`CREATE`, or `CREATE OR REPLACE` something an earlier migration defined. Reading only the original migration file (or hand-tracing the full history) can give a stale picture. Introspecting the live database is the only reliable way to get the current definition, which is why doc files embed that live-dumped SQL directly rather than linking to migration history as the source of truth.

See the [update-docs skill](../.claude/skills/update-docs/SKILL.md) for the full checklist this fits into.
