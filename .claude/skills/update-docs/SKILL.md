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
3. For any Supabase element (table/policy/function), get the current DDL via `npx supabase db dump --local --schema public -f <scratch-file>.sql`, copy the exact current block into the doc's "Current DDL"/"Current definition" section, then delete the scratch file. Never hand-paraphrase or copy from the migration file directly.
4. If something was removed, delete its doc file and its row in the domain `README.md` index — don't leave stale entries.
5. Update the relevant domain `README.md` index table for any addition/removal.
6. Keep entries concise: purpose, shape/signature, current behavior, related-doc links. No "changed in this task" language.
