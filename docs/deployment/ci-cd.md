# CI/CD workflows

Three GitHub Actions workflows, all under `.github/workflows/`.

## `ci.yml`

Runs on every PR into `main` or `staging`: `npm ci`, `npm run lint`, `npm run build`, `npm run test`. The job is named `lint-test-build` — that's the exact name required by `main`'s branch protection status check (see [README.md](./README.md)).

Pinned to Node 24 via `actions/setup-node`, not Node 20. `actions/setup-node` silently substitutes the runner's ambient pre-installed Node build when asked for a version it considers deprecated, rather than erroring — that ambient build had a broken `worker_threads.markAsUncloneable`, which `undici` (a `jsdom` dependency, used by the Vitest/jsdom test environment) calls unconditionally. The result was every test file failing identically with `webidl.util.markAsUncloneable is not a function`, only in CI, never locally (where Node 24 was already explicitly installed, not substituted). Pinning an explicit, currently-supported version makes `setup-node` actually install that Node rather than falling back to whatever the runner happens to have.

## `deploy-migrations.yml`

Runs on a push to `staging` or `main` that touches `supabase/migrations/**`, or manually via `workflow_dispatch`. Two jobs, gated by `github.ref`:

- `deploy-staging` (`if: github.ref == 'refs/heads/staging'`) — runs under the `staging` Environment.
- `deploy-production` (`if: github.ref == 'refs/heads/main'`) — runs under the `production` Environment, which sits behind the required-reviewer approval gate (see [environments.md](./environments.md)).

Both jobs are otherwise identical: `supabase db push --db-url "$SUPABASE_DB_URL"`. See [environments.md](./environments.md) for why `--db-url` is used instead of `supabase link`, and why `SUPABASE_DB_URL` must be the pooler connection string.

`workflow_dispatch` exists so the workflow can be run manually against a live project without needing an actual migration-file change to satisfy the path filter — useful the first time a brand-new hosted project needs its first migrations pushed, since nothing in `supabase/migrations/` changes on a day you're only setting up the project.

## `keepalive-ping.yml`

Runs every 3 days (`cron: "0 0 */3 * *"`) plus `workflow_dispatch`. Two jobs, `ping-staging` and `ping-production`, each a single `curl -sf -X POST` to that project's `rest/v1/rpc/keepalive_ping` using the repo secrets described in [environments.md](./environments.md). `-f` makes curl exit non-zero on any non-2xx response, so a failed ping fails the workflow run — which GitHub emails to the repo owner by default; no extra alerting is configured.

Exists because Supabase's free tier auto-pauses a project after 7 days of inactivity, with no automatic wake-up (see [README.md](./README.md) for why self-hosting was rejected instead). Calls [`keepalive_ping()`](../rpc-functions/keepalive_ping.md) — a trivial RPC that reads from a Postgres system catalog table rather than computing a value or touching an app table — specifically because a bare health-check GET (hitting an endpoint without querying anything) has been reported not to reliably count as activity, and reading a catalog table keeps the ping decoupled from application schema changes. Runs every 3 days, comfortably under the 7-day threshold, so a missed run or two isn't a problem.
