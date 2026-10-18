-- Every table in this schema was created via raw SQL migrations, never
-- Supabase's Table Editor UI -- which is what normally bundles in the
-- Data API's table-level grants automatically on a hosted project. RLS
-- policies here have always assumed anon/authenticated already have
-- SELECT/INSERT/UPDATE/DELETE on their tables (e.g. roles' policy says
-- "any authenticated user can read all rows"), but a Postgres GRANT is
-- checked before RLS ever runs -- RLS narrows which rows are visible once
-- a role is already allowed to touch the table at all, it is not a
-- substitute for the base GRANT. This went unnoticed locally because the
-- local Docker stack's own init applies a broader baseline that hosted
-- projects don't replicate; confirmed via a live 403 ("permission denied
-- for table categories", SQLSTATE 42501) against the hosted production
-- project, then confirmed project-wide via
-- information_schema.table_privileges showing REFERENCES/TRIGGER/TRUNCATE
-- but never SELECT/INSERT/UPDATE/DELETE on every table. RLS remains the
-- real per-row/per-operation gate; this just supplies the missing
-- table-level prerequisite it was always assumed to have.

grant select, insert, update, delete on all tables in schema public to anon, authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
