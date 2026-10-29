# SignStack

BSL (British Sign Language) flashcard web app.

## Stack

- Frontend: React 19 + TypeScript + Vite
- Backend: Supabase (Postgres, Auth, RLS, RPC/Postgres functions, Storage) — run locally via Docker during development
- Package manager: npm

## Skill usage

Every section below that names a skill is a mandatory pointer, not something to paraphrase from memory. **Invoke that skill with the `Skill` tool once per logical task, before the action it covers** — then follow that one load through the short sequence of steps it prescribes. Don't re-invoke it before every individual command inside that same task, but also don't let one invocation from an earlier, different task stand in for this one: reproducing a skill's commands from memory because a similar task invoked it earlier in the session is bypassing it. A hook denial is a fallback for when this was skipped — treat a denial as evidence a skill should have been invoked first, not as a substitute for invoking it.

## Running locally

- Install deps: `npm install`
- Start the local Supabase stack (Docker must be running): `npx supabase start`
- Apply `supabase/migrations/` and seed sample data, including sign videos: `npm run db:reset:seeded` (runs `supabase db reset` then `scripts/seed-sign-videos.mjs`, which uploads the local video files and isn't part of `db reset` itself)
- Start the dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

`npx supabase start` (or `npx supabase status`) prints a local API URL and anon key. `.env.local` must define `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` pointing at those values (see `src/vite-env.d.ts` for the expected shape). Do not read, write, or print the contents of `.env.local` — treat it as opaque and let the user manage it.

## Documentation system (read before editing code)

[`/docs`](./docs/README.md) is a hand-maintained wiki describing the CURRENT state of the codebase. **Before grepping `src/` or `supabase/` to understand how something works, check the matching file(s) in `/docs` first.**

**ALWAYS use the [`update-docs`](./.claude/skills/update-docs/SKILL.md) skill** after any change that adds, modifies, or removes a component, hook/utility, table, RLS policy, or RPC function — it is the sole source of truth for what and how to document.

## Build workflow

**Library-first for new components/functions:** when asked to build a new component, icon, or utility function, first check whether a well-tested existing library or plugin already provides it. Recommend the library and get confirmation before building a custom implementation. Only build custom when no suitable library exists.

**Extract shared code instead of duplicating it:** don't duplicate a component or its styling across pages — whether explicitly asked to copy something, or discovered while building something new that turns out to share structure with existing code. When a new page/component would repeat markup, styling, or logic that already exists elsewhere (or when building two similar things in the same task, like a login and signup page), extract the shared part into its own reusable file that both import, rather than pasting a second copy. Recognize this during design, not only when told to.

**Once a plan is approved, ALWAYS ask whether to use the [`build-ui`](./.claude/skills/build-ui/SKILL.md) skill before implementing** — ask regardless of whether the task looks UI-related or whether any visual element seems to be involved. This covers color, spacing, layout, and icon choice (including the Lucide-vs-custom-SVG call the library-first rule above would otherwise leave to judgment). There are no exceptions: not an explicit instruction naming what to change, not a task that looks purely backend/logic, not my own judgment that no visual element is involved. Ask every time, after the plan is approved and before implementing.

## Testing

**ALWAYS use the [`run-tests`](./.claude/skills/run-tests/SKILL.md) skill to run tests.** **ALWAYS use the [`suggest-tests`](./.claude/skills/suggest-tests/SKILL.md) skill after development ends** for instructions on how to build tests. These two skills are the sole source of truth for testing behavior in this repo.

**Skipping a test run entirely is ONLY acceptable when a change does nothing but swap Tailwind utility classes (color/spacing/shadow/border) on already-tested elements** — no text content change, no renamed custom CSS class, no structural or prop change. This suite queries by role/text, never by Tailwind class name, so that specific case is provably safe to skip. Everything else — including anything that merely "feels cosmetic" — still goes through `run-tests`; a prior incident where a renamed *custom* CSS class broke two unrelated tests is why this exception stays this narrow.

## Database migrations

`supabase/migrations/` is the source of truth for schema, RLS policies, and RPC functions. Use the [`migrations`](./.claude/skills/migrations/SKILL.md) skill for the full workflow.

## Workflow enforcement

**Check this file for a matching skill before starting any task, and follow it — that is the primary mechanism, not a suggestion to fall back on after the fact.** Hooks (`.githooks/pre-commit`, `.claude/hooks/*`) exist only as a fallback safety net for when a skill wasn't followed; a hook denial means a skill should have been consulted earlier, not that the hook is the thing to satisfy. A `diff-reviewer` subagent also exists for read-only, independent review of a diff. Rationale and rejected alternatives: [`docs/workflow-automation.md`](./docs/workflow-automation.md).

`npm run test-hooks` verifies the enforcement is actually wired up — the failure modes are all silent. If it reports `core.hooksPath` unset (a fresh clone, or `npm install --ignore-scripts`), run `npm run setup-hooks`.
