---
name: build-ui
description: Use for any visual-design decision — color, spacing, layout, icon choice, component structure — for a new page/component, a redesign, or a change to existing UI. Owns the handoff to the ui-designer subagent and the implement-then-approve loop. The only exception is an explicit, direct instruction from the user naming exactly what to change (e.g. "change the header background from brand-muted to brand") — apply that directly instead, per ui-repo-conventions.
---

# Build UI

**Exception rule, stated up front**: skip this skill only when the user gives an explicit, direct instruction naming exactly what to change (their own example: "change the header's background from `brand-muted` to `brand`") — apply that directly, consulting `ui-repo-conventions` for correct token/icon names. Anything looser — "make this look better," "design a page for X," "redo this section," or a judgment call I'd be making myself about color/spacing/icons — still goes through this skill in full.

Backend/logic work (schema, hooks, data flow) comes first; this skill owns what happens once that's in place and the visual design still needs deciding.

## Workflow

1. **Invoke `ui-designer`** via the `Agent` tool with `run_in_background: false` — the next step depends directly on its output. Give it the full brief: what was just built on the backend (data shape, states to handle — loading/error/empty), what page/component needs designing or changing, and any style preferences the user already expressed. It already knows to ground itself in `ui-ux-pro-max`, `frontend-design`, and the binding `ui-repo-conventions` skill — instruct it to report back a concrete spec, not prose musing.
2. **Only after it reports back**, read `.claude/skills/ui-repo-conventions/SKILL.md` yourself — not before — so your own implementation is checked against the same binding rules the agent used, without loading it into context before it's needed.
3. **Implement** the UI per the agent's spec + the conventions skill. Reuse/extract shared components per CLAUDE.md's "extract shared code" rule. If the spec calls for a shadcn component not yet in `src/components/ui/`, add it with `python .claude/skills/ui-styling/scripts/shadcn_add.py <component>` — this is a write action and happens here, not inside `ui-designer`. If the spec recommends persisting the design system, run `ui-ux-pro-max`'s `--design-system --persist --output-dir <project-root>` command yourself at this point — same write-vs-decide split. Do not run `tailwind_config_gen.py` — this repo configures Tailwind v4 via `@theme inline` in `src/index.css`, not a `tailwind.config.js`.
4. **Before resuming**, make sure the dev server is running (`npm run dev`, and `npx supabase start` first if the page touches data) — same commands as CLAUDE.md's "Running locally" section. **Resume the same agent** (`SendMessage` to its id/name — never a fresh cold spawn), passing the local URL, so it can check your implementation against its own spec, a live screenshot, and the conventions skill before telling the user it's ready.
5. **Present for approval.** If the user requests changes, resume that same agent again for revised suggestions, re-implement, re-check, repeat until approved. The design task isn't finished until approval — don't treat the first implementation pass as done.
6. Once approved, normal workflow resumes unchanged: `suggest-tests` → `run-tests`, `update-docs`.

## Why the agent is read-only

`ui-designer` is read-only (`tools: Read, Grep, Glob, Bash, Skill, mcp__playwright`) — it decides and reports, it never edits files; implementation is always done by the caller. This mirrors this repo's own documented split (`docs/workflow-automation.md`): "delegate decided work, never the decision," enforced structurally via the `tools:` frontmatter, not by instruction. Two hooks back this structurally rather than relying on the agent's own discipline: `block-vendored-design-skills.mjs` (only `ui-designer` may invoke the vendored design skills directly) and `block-ui-designer-writes.mjs` (denies `ui-designer` any `Bash` command that would write a file by another means — redirects, `sed -i`, `cp`/`mv`/`tee`/`rm`, or the write-capable commands named above).
