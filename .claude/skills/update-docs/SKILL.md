---
name: update-docs
description: Use after making any code change that adds, modifies, or removes a React component, hook/utility, database table, RLS policy, or RPC function — checks that the matching /docs files were created or updated to reflect current state before the change is considered finished.
---

# Update docs

This skill covers **when and what** to document, and how to delegate the writing.

**How to write a doc lives in [`docs/documentation-standards.md`](../../../docs/documentation-standards.md)** — voice, structure, the current-state-never-history rule, Supabase DDL embedding, index maintenance. Read it before writing or reviewing doc prose. It is deliberately not duplicated here: one source, nothing to drift.

## 1. What changed?

List the components, hooks/utils, tables, RLS policies, and RPC functions added, modified, or removed in this task.

## 2. Map each to its doc

| Source | Doc |
|---|---|
| `src/components/Foo.tsx` | `docs/components/Foo.md` |
| `src/pages/Foo.tsx` | `docs/components/Foo.md` — **pages map into `components/`**, there is no `docs/pages/` |
| `src/hooks/useFoo.ts` | `docs/hooks/useFoo.md` |
| `src/lib/foo.ts` | `docs/utils/foo.md` |
| table `foo` | `docs/db-schema/foo.md` |
| policy on `foo` | `docs/rls-policies/foo/<policy_name>.md` |
| RPC `foo()` | `docs/rpc-functions/foo.md` |
| Storage bucket `foo` | `docs/storage/foo.md` |

`src/components/ui/**` is vendored shadcn and is **not** documented.

This mapping is also encoded in `.claude/hooks/check-docs.mjs`, which the pre-commit gate uses to block a commit whose staged `src/` changes have no matching staged doc. Keep the two in step.

## 3. Write it, or delegate it

**Default to delegating to `docs-auditor`.** Doc prose is output-heavy, and generating it in a subagent keeps that cost out of the main context — this is the default even for a single doc file, not just for "several to update."

**Write it directly only when the total edit across all doc files is 5 lines or fewer** (a changed signature, a corrected prop name, a one-line addition to an index table) — small enough that delegating would cost more in round-trip overhead than it saves. Anything larger, including "just one doc but it needs a few paragraphs," goes to `docs-auditor`.

**During rapid iteration on the same element** (several small tweaks to one component in quick succession — a back-and-forth styling session is the common case), **don't update docs after every micro-step.** Wait until the iteration settles — the user moves to a different file/feature, or says they're done — then write the doc once against the final state. A doc update that goes stale before the next message isn't thoroughness, it's wasted work.

### Delegating to `docs-auditor`

The agent derives everything it can from the code (prop tables, signatures, paths, orphaned files, broken index rows). What it **cannot** derive is *why* a non-obvious choice was made. That has to come from you, in the spawn prompt — frontloaded, not waited for. The agent can detect *that* a structural choice exists but cannot reliably judge which choices are non-obvious, so left to ask it may query something trivial and miss the real rationale.

**The why-brief: 2–5 bullets, ≤100 words total, one per non-obvious decision**, each naming the choice and the constraint or incident behind it.

Worked example (`ScorePill`, ~45 words):

> - Nested flex groups + `leading-none`: mixing `text-sm`/`text-lg` inline misaligned vertically, because Tailwind font-size utilities bundle their own `line-height`.
> - Divider is an empty `h-4 w-px` span, not a `|` glyph: a glyph's ink is not centred in its line box, so it reads as offset.

Also give it: which doc files are in scope, and `docs/components/FlashcardRound.md` as the voice template.

If it reports a decision it had no rationale for, answer with `SendMessage` to the same agent — that **resumes** it with its context intact rather than respawning it cold.

**Then verify its output by reading the diff.** An agent's report states what it intended, not what it did. Check specifically that it did not **fabricate** a rationale it was not given — a confidently invented "why" is worse than a gap, because a reader cannot tell it is wrong.

## 4. Index rows

Every addition or removal updates the domain `README.md` table. Details in [`documentation-standards.md`](../../../docs/documentation-standards.md).
