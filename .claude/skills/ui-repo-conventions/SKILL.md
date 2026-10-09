---
name: ui-repo-conventions
description: Binding visual/UI conventions for this repo — color tokens, icon library, shared-component reuse. Read by the ui-designer subagent before proposing any design, and by the caller before implementing it (or before making an explicitly user-directed tweak). Not optional inspiration — a design suggestion that conflicts with these must be remapped onto them, never applied as-is.
---

# UI Repo Conventions

This skill is the binding source of truth for this repo's visual-design rules. The vendored design-intelligence skills (`ui-ux-pro-max`, `frontend-design`, `ui-styling`) are inspiration and search tools — this skill is not. Where a suggestion from any of them conflicts with what's written here, remap it onto these rules rather than applying it raw.

## Color tokens

Every color value lives in `src/index.css`'s `:root` (light) and `.dark` blocks as a named CSS variable (e.g. `--foreground`, `--ring`) — never hardcode a raw color value (hex/oklch/rgb) inside a component. Name tokens by role ("what it's for" — `--muted-foreground`, `--destructive`) not by appearance ("what it looks like" — `--gray-500`), so the name stays meaningful if the actual value changes later.

**When asked to use or add a color:** default to an existing variable that already matches or is close — this is what prevents drift like one component using `0.985` and another using `0.976` for what's supposed to be the same shade. But don't stretch an existing token to cover a role it wasn't named for just to avoid adding one: when the design genuinely calls for something the current palette doesn't express — a new semantic role, or a deliberate accent color — propose a new variable openly, say plainly why an existing token wasn't the right fit, and still express it through the token system (a properly semantic name, defined in both `:root` and `.dark`, mapped in `@theme inline` if it needs its own Tailwind utility like `bg-*`/`text-*`/`ring-*`) rather than inlining a literal value in the component.

**Current token inventory** (so a design decision doesn't have to re-derive this by reading `src/index.css` itself): `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `success`, `brand`, `brand-foreground`, `brand-strong`, `brand-muted`, `input`, `ring`, `chart-1` … `chart-5`, `sidebar`, `sidebar-foreground`, `sidebar-primary`, `sidebar-primary-foreground`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-border`, `sidebar-ring`, `border`.

**Known gap, don't silently "fix" it**: `--accent` and `--border` are defined only in `.dark`, not in `:root` — a real gap in the current code. If a design calls for either in light mode, flag it and ask rather than assuming a value or quietly adding one.

## Icons

Lucide (`lucide-react`) is this repo's established icon library — already a dependency, used throughout (`CategoryMenu.tsx`, `DeckGrid.tsx`, `CreateDeckPage.tsx`, and the `src/components/ui/*` shadcn primitives). `ui-ux-pro-max`'s icon catalog is Phosphor-based — never propose Phosphor or any other icon set, even when it's what that skill returns. Translate any icon recommendation into its closest `lucide-react` equivalent before it reaches a spec or a component.

## Shared components

Before proposing or building new markup, check `docs/components/README.md` for something already covering the need — reuse or extend it rather than duplicating structure, styling, or logic. This is the same rule as CLAUDE.md's "extract shared code" bullet; it isn't restated here, just pointed at.

## Relevant vendored skills

`.claude/skills/` also contains `banner-design`, `brand`, `design-system`, `design`, and `slides` from the same upstream `ui-ux-pro-max` plugin (its manifest registers the whole `.claude/skills/` folder as one unit — these aren't separate installs). They target marketing collateral (logos, banners, slide decks, brand guidelines) and are out of scope for this app's page/component UI.

Three are in scope:
- **`ui-ux-pro-max`** — design-intelligence search (styles, colors, typography, icons, charts, stacks).
- **`ui-styling`** — shadcn/Tailwind reference docs, plus its `shadcn_add.py` script (adds a shadcn component — a write action) and `tailwind_config_gen.py`. `tailwind_config_gen.py` does **not** apply to this repo: we configure Tailwind v4 via `@theme inline` in `src/index.css`, not a `tailwind.config.js` — running it would create a competing config file.
- **`frontend-design`** — Anthropic's own aesthetic-direction skill. Different license from the rest (© Anthropic PBC, Commercial Terms of Service — not MIT like the `ui-ux-pro-max` folders); see `.claude/skills/frontend-design/LICENSE.md`.

## Observed, not guessed

`ui-designer`'s resume-time check screenshots the repo's actual running dev server (real color tokens, real light/dark mode via the real `.dark` class), not a static mockup. A finding like "contrast fails in dark mode" is an observed result from that screenshot, not an inference from reading token names in `src/index.css`.

## Write vs. decide split on scripts

`shadcn_add.py` adds files to the project (runs `npx shadcn@latest add ...`), and `ui-ux-pro-max`'s `--persist` flag writes a `design-system/<slug>/MASTER.md` to the project. Per this repo's decision-vs-write boundary (see `docs/workflow-automation.md`), the read-only `ui-designer` subagent only *recommends* which shadcn component(s) to add, and whether to persist a design system, in its spec — running `shadcn_add.py` or the `--persist` command happens during implementation in `build-ui`, done by the caller, not the agent.
