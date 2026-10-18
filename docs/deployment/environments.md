# Environments & secrets

Two GitHub Environments exist (Settings → Environments): `staging` and `production`. [`deploy-migrations.yml`](./ci-cd.md) is the only workflow that references either — a job declaring `environment: production` can only read `production`'s own secrets, never `staging`'s, and vice versa.

## `staging` Environment

- Secret: `SUPABASE_DB_URL` — the staging Supabase project's pooler connection string.
- No protection rules. A push to `staging` deploys migrations automatically.

## `production` Environment

- Secret: `SUPABASE_DB_URL` — the production Supabase project's pooler connection string.
- Protection rule: **required reviewers** (the repo owner). This is the manual-approval gate — a push to `main` that touches `supabase/migrations/**` triggers the job, but it sits waiting for approval before it ever runs against the live database.

Both `SUPABASE_DB_URL` values must be the **pooler** connection string (Session mode), not the direct `db.<ref>.supabase.co` host — the direct host only resolves over IPv6 on free-tier projects, and GitHub-hosted runners have no IPv6 connectivity, so it would time out in CI despite working from a local machine.

## Repository secrets (not Environment-scoped)

Settings → Secrets and variables → Actions → Repository secrets: `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY`, `PRODUCTION_SUPABASE_URL`, `PRODUCTION_SUPABASE_ANON_KEY`. Used only by the keep-alive ping workflow (see [ci-cd.md](./ci-cd.md)).

These are deliberately plain repo secrets, not pulled into the `staging`/`production` Environments, for two reasons:

1. The anon key isn't actually sensitive — it already ships inside the deployed frontend bundle. There's no isolation to gain by scoping it.
2. If the keep-alive ping job declared `environment: production`, it would inherit that Environment's required-reviewer gate — meaning every scheduled run (every 3 days) would sit waiting for manual approval, defeating the point of an unattended ping. The gate is meant to protect migrations, not read-only pings.

## Why `SUPABASE_ACCESS_TOKEN`/`SUPABASE_PROJECT_REF` aren't used

An earlier version of `deploy-migrations.yml` used `supabase link --project-ref <ref>` before `db push`, authenticated via a `SUPABASE_ACCESS_TOKEN` personal access token. `link` calls Supabase's Management API, which requires that token to be scoped with Read on Project Settings/API Keys/API Key Secrets — unnecessary complexity for a job that only ever pushes migrations. `db push --db-url <connection-string>` connects straight to Postgres and skips the Management API (and the token-scoping question) entirely.
