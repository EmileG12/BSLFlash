# SignStack Documentation

This is a hand-maintained wiki describing the **current state** of the SignStack codebase. It is not a changelog — every file here is edited in place to describe what exists *now*; nothing is appended as history.

This folder is a plain markdown tree, so it works two ways:
- Browsed directly on GitHub (folders/links render normally).
- Opened as an [Obsidian](https://obsidian.md) vault (point Obsidian at this `docs/` folder) for graph view, backlinks, and full-text search. Links use standard markdown `[text](./path.md)` syntax throughout (not Obsidian wiki-links), so they work identically either way.

## Contents

- [architecture.md](./architecture.md) — how the pieces fit together, current state of the app.
- [components/](./components/README.md) — React components.
- [hooks/](./hooks/README.md) — custom React hooks.
- [utils/](./utils/README.md) — non-hook utility modules (e.g. the Supabase client).
- [db-schema/](./db-schema/README.md) — database tables.
- [rls-policies/](./rls-policies/README.md) — Row Level Security policies, grouped by table.
- [rpc-functions/](./rpc-functions/README.md) — Postgres functions exposed via Supabase RPC.
- [storage/](./storage/README.md) — Supabase Storage buckets.
- [tests/](./tests/README.md) — what the test suite covers, kept separate from the component/hook/utility docs so test docs don't flood the docs for the actual codebase; each entry links back to the doc of the thing it tests.

## How this is used

Before searching `src/` or `supabase/` to understand how something works, check the matching file(s) here first. As part of finishing any change that adds, modifies, or removes a component, hook/utility, table, RLS policy, or RPC function, the matching doc file(s) are updated in the same change — see the `update-docs` skill. New or changed test files are documented separately under `tests/` — see the `suggest-tests` skill. Creating or applying a `supabase/migrations/` change (schema, RLS, or RPC) goes through the `migrations` skill instead of being documented here — see that skill for the full workflow, including how it keeps this wiki in sync. For Supabase elements (tables, policies, functions), each doc file embeds the current live SQL definition directly, so it's a self-contained source of truth — no need to trace migration history to know current behavior.
