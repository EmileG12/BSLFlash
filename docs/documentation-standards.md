# Documentation standards

How anything in `/docs` is written. The single source of truth for this — the [`update-docs`](../.claude/skills/update-docs/SKILL.md) skill covers *when* and *what* to document and links here for *how*, and the `docs-auditor` agent is pointed at this file rather than carrying its own copy of the rules.

Applies to anyone writing a doc here: a person, the main agent, or `docs-auditor`.

## Current state, never history

Every file describes what exists **now**. Edit in place; never append a changelog entry, a "changed in this task" note, or a dated revision. Git already holds the history, and a doc that accumulates history stops being readable as a description of the present.

Consequences:

- When something is removed, **delete** its doc file and its row in the domain `README.md` index. A stale entry is worse than a missing one, because it is trusted.
- When something is renamed, rename the doc and fix inbound links.
- No "TODO", "coming soon", or aspirational content. Document what is, not what is planned.

## Structure

Follow the shape of the existing docs rather than inventing a layout. For a component or hook:

- **Path** — the source file, and for a page its route.
- **Purpose** — one or two sentences on what it is for. For something extracted from elsewhere, say why it was extracted.
- **Props / Signature** — a table for props; the full type signature for a hook or utility.
- **Key behavior** — the interesting mechanics. State machines, effects, why a particular approach was taken.
- **Edge cases handled** — only where non-obvious.
- **Depends on / Used by** — links to the other docs, not bare filenames.

Worked examples to copy from: [`components/FlashcardRound.md`](./components/FlashcardRound.md) and [`hooks/useRoundProgress.md`](./hooks/useRoundProgress.md).

## Capture the *why*, not just the *what*

This is what makes these docs worth more than reading the source. The code already states what it does; a doc that only restates that is noise.

So prefer the second of each pair:

> Uses nested flex groups with `leading-none`.

> Uses nested flex groups with `leading-none` because mixing `text-sm` and `text-lg` inline misaligned vertically — each Tailwind font-size utility bundles its own `line-height`, and those do not line up across sizes.

The second survives contact with a future reader who is about to "simplify" it.

Record, where they apply: the constraint or bug that forced a design, approaches tried and rejected, and anything that would surprise a reader. **Never invent a rationale** — if the reason is unknown, describe the behaviour and stay silent on why. See the anti-fabrication rule in [`docs-auditor`](../.claude/agents/docs-auditor.md).

## Concision

Purpose, shape, current behavior, links. No preamble, no restating the file path in prose, no summary section that repeats the body. Cut any sentence a reader would skip.

## Supabase elements

For a table, RLS policy, RPC function, or Storage bucket, embed the **current live SQL definition** in the doc so it is self-contained — a reader should never have to trace migration history to know current behaviour. Get that definition per the [`migrations`](../.claude/skills/migrations/SKILL.md) skill's "Keeping /docs in sync" section. Never hand-paraphrase it, and never copy it from a migration file: a migration shows one step, not the cumulative current shape.

## Indexes

Every addition or removal updates the domain `README.md` table in the same change. One row, one line, purpose phrased so it is useful when scanning: what it is for, not a restatement of its name.

## architecture.md

Update [`architecture.md`](./architecture.md) only for a real architectural shift — a new route group, a new data-flow pattern, a new top-level feature. Not for each component or hook, which belong in their own category file. It is a map of the territory, not a duplicate of the detail docs it links to.
