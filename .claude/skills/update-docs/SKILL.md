---
name: update-docs
description: Use after making any code change that adds, modifies, or removes a React component, hook/utility, database table, RLS policy, or RPC function — checks that the matching /docs files were created or updated to reflect current state before the change is considered finished.
---

# Update docs

`/docs` describes the CURRENT state of the codebase only — edit files in place, never append change-log entries.

1. List what changed in this task: components, hooks/utils, tables, RLS policies, RPC functions added/modified/removed.
2. For each, create or update the matching doc file:
   - `src/components/Foo.tsx` -> `docs/components/Foo.md`
   - `src/hooks/useFoo.ts` -> `docs/hooks/useFoo.md`
   - `src/lib/foo.ts` (or similar) -> `docs/utils/foo.md`
   - table `foo` -> `docs/db-schema/foo.md`
   - each policy on `foo` -> `docs/rls-policies/foo/<policy_name>.md`
   - RPC function `foo()` -> `docs/rpc-functions/foo.md`
3. For any Supabase element (table/policy/function), get the current DDL per the `migrations` skill's "Keeping /docs in sync" section, and copy it into the doc's "Current DDL"/"Current definition" section. Never hand-paraphrase or copy from the migration file directly.
4. If something was removed, delete its doc file and its row in the domain `README.md` index — don't leave stale entries.
5. Update the relevant domain `README.md` index table for any addition/removal.
6. Keep entries concise: purpose, shape/signature, current behavior, related-doc links. No "changed in this task" language.
7. Update `docs/architecture.md` only when the change is a real architectural shift (a new route group, a new data-flow pattern, a new top-level feature) — not for every component/hook addition, which belongs in its own `/docs` category per steps 1-2 instead. `architecture.md` is a map of the territory, not a duplicate of the detailed docs it links to.
