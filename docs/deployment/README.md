# Deployment

How SignStack is hosted, deployed, and kept running — as opposed to `/docs`'s other domains, which describe the app itself.

## Branches

`main` is production, `staging` is pre-production. Both are long-lived; everything else is a short feature branch merged into one of them via PR.

`main` has GitHub branch protection (repo ruleset "Require PR before merging"): PR required (no direct pushes), 0 required approvals (solo project — GitHub never lets a PR author approve their own PR, so a nonzero requirement would be a permanent lock-out), conversation resolution required, merge-commit only (never squash — commit messages here are deliberately detailed, squashing would collapse them into one GitHub-generated message), the branch must be up to date with `main` before merging, and the `lint-test-build` status check (from [`ci.yml`](./ci-cd.md)) must pass. `staging` has no protection — it's pre-production, pushed to directly.

## Environments

- [environments.md](./environments.md) — GitHub Environments, secrets, and why they're split the way they are.
- [ci-cd.md](./ci-cd.md) — the three GitHub Actions workflows.
- [hosting.md](./hosting.md) — the two Supabase projects, Vercel, and the production bootstrap process.

## Why no self-hosting

Supabase's free tier pauses a project after 7 days of inactivity (no auto-wake). Self-hosting (a VPS + Coolify running the official Supabase stack) was evaluated to avoid this, but rejected: Supabase's own docs list 8GB RAM as the realistic floor for Coolify + the self-hosted stack together, meaningfully pricier than the ~€5/mo first floated, plus ongoing patching/backup-testing/update burden with no automatic rollback if a Supabase stack upgrade breaks something. Both environments stay on Supabase's free tier instead, with the pause mitigated by a keep-alive ping (see [ci-cd.md](./ci-cd.md)).
