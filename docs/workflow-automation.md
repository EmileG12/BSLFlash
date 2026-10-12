# Workflow automation

Why this project enforces its own workflow with hooks, why it uses only three subagents, and which ideas were rejected. A decision record — the alternatives matter as much as the choice, because each was rejected for a reason that still applies.

## The problem

The workflow rules (CLAUDE.md, plus the `update-docs` / `suggest-tests` / `migrations` skills) all depended on the agent *choosing* to follow them. That is probabilistic: instructions read hundreds of messages ago fade, and compaction can summarize away exactly the nuanced parts. The failure mode was real and recurring — finishing a change without updating docs or running tests, and needing a reminder.

## Two tiers

| Tier | Mechanism | Guarantees |
|---|---|---|
| **1** | Hooks — the harness runs them, the agent gets no vote | Outcome |
| **1.5** | Hook output that *injects an instruction* | Delivery, not compliance |
| **2** | CLAUDE.md, skills, memory | Nothing, once attention drifts |

Tier 1.5 currently has no live example in this repo — the one hook built for it turned out not to deliver at all; see [Removed: the per-turn `Stop` hook](#removed-the-per-turn-stop-hook) below. The tier is kept in this table because the distinction (delivery vs. compliance) is still the right way to reason about any future hook output that isn't a hard block.

Three principles follow:

**Enforce outcomes, not process.** No script can check "did the agent invoke `update-docs`". A script can trivially check "do the changed `src/` files have matching changed `docs/` files". The second is what actually matters and is agnostic to how it was achieved.

**Prefer doing over checking.** A hook is a shell command, so it can *run* lint and tests itself rather than verifying someone else did. That converts "did the agent remember?" into a non-question, and removes a decision: the agent never needs to recall the right test flags, because it is not choosing the command.

**But put the expensive gate at the boundary.** Verification that executes things is only affordable where it runs once per unit of work. An earlier design ran `--changed` at every turn end; costed against one real feature (~15 turns, nearly all touching `src/`) that is 15 test runs, mostly after micro-iterations like swapping a colour token — plausibly more costly than the drift it prevents. So: **turn-end reports, commit executes** — originally meant literally (a turn-end status line plus a commit-time gate), though the turn-end half turned out not to be deliverable; see below.

## What runs where

| | Trigger | Does | Cost |
|---|---|---|---|
| Pre-action | `PreToolUse` on Bash (`.claude/hooks/require-test-redirect.mjs`) | Denies an unredirected test run, handing over the corrected command | only when triggered |
| Pre-action | `PreToolUse` on Bash, `agent_type === 'ui-designer'` only (`.claude/hooks/block-ui-designer-writes.mjs`) | Denies any Bash command that would write a file by another means (redirects, `sed -i`, `cp`/`mv`/`tee`/`rm`, or a write-capable script flag) | only when triggered |
| Pre-action | `PreToolUse` on Skill (`.claude/hooks/block-vendored-design-skills.mjs`) | Denies the main session (or any non-`ui-designer` agent) invoking a vendored design-intelligence skill directly, routing it through `build-ui` instead | only when triggered |
| Boundary | `.githooks/pre-commit` | Runs the docs mapping check (`.claude/hooks/check-docs.mjs`), lint, and `--changed`; **blocks** | once per commit |

Two wiring mechanisms are in play here, each for a different tool:

- **`.claude/settings.json` for Claude Code's own tools.** The three `PreToolUse` hooks above are registered in `.claude/settings.json` under a `matcher` (`Bash` or `Skill`) — the harness calls them before the matched tool runs and reads a JSON `permissionDecision` back on stdout. This file is tracked, so the wiring survives a clone with no separate opt-in step (unlike the git mechanism below).
- **`core.hooksPath=.githooks` for git itself.** By default git looks for hooks in `.git/hooks/`, which it never tracks — so a hook there can't be reviewed, shared, or survive a clone. `core.hooksPath` (git 2.9+) overrides that location, letting the hook scripts live in a tracked directory. Note it is an **override, not an addition**: once set, `.git/hooks/` is ignored entirely, with no warning that a hook placed there will never run. The config itself lives in `.git/config`, which is *still* not tracked — deliberately, since a repo that could configure itself to execute scripts on clone would make `git clone` remote code execution. So the pointer needs a local opt-in: `npm run setup-hooks` (just `git config core.hooksPath .githooks`), run automatically by `postinstall`. This is the same mechanism Husky uses, which is why Husky isn't a dependency here — the only part needed is the one-line config.

## Removed: the per-turn `Stop` hook

A `Stop` hook (`.claude/hooks/check-docs.mjs`, called with no args) used to run after every turn and print a one-line status — e.g. `1 src file(s) changed · docs untouched: docs/hooks/useFoo.md` — never blocking, never running lint or tests. It was meant to be the Tier 1.5 row from the table above: hook output that injects an instruction without the cost of a full gate.

It never worked, and the failure was silent in exactly the way Tier 1.5 is supposed to avoid. For a `Stop` hook, plain `stdout` on exit 0 is shown only in `--debug`/transcript view — it is **not** delivered into the agent's context. The one channel that is delivered back is a JSON payload with `"decision": "block"` plus a `reason`. `check-docs.mjs` was emitting a plain string, so the status line existed, ran correctly, computed the right answer, and never once reached the agent. This was only caught by asking the agent to echo the hook text verbatim in its next reply and getting nothing back — the status line table above already classifies this as the mechanism that delivers an instruction, so an instruction that silently never arrives is this tier failing at the one thing that distinguishes it from Tier 2.

Two ways to actually fix delivery were considered and rejected:

- **Emit `decision: "block"` instead of plain stdout.** This does deliver the text, but `decision: "block"` forces the turn to continue every time anything is even slightly stale — reintroducing the exact per-turn cost that "put the expensive gate at the boundary" (above) already moved the `--changed` test run away from.
- **Leave it broken.** Worse than deleting it: a hook whose code and comments claim a tier-1.5 role it structurally cannot fill misleads the next reader of this file into believing per-turn feedback exists when it does not.

Deleted instead. `.githooks/pre-commit` was never affected by this bug — it blocks by making `git` itself refuse the commit, which is surfaced as ordinary command output by whatever ran `git commit`, not through a Claude Code hook's feedback channel. `check-docs.mjs` survives, stripped down to only the code path `.githooks/pre-commit` actually calls (`git diff --cached`, blocking on exit 1); the no-args status-line branch, its `stop_hook_active` loop guard, and the file-mtime staleness check that only that branch used are gone with it.

## Verifying the enforcement: `npm run test-hooks`

The hooks are deterministic scripts, so they don't need a behavioural test — they need a **wiring** test, because every way they break is silent. `scripts/test-hooks.mjs` asserts observable behaviour (not config values) across 26 checks: that `core.hooksPath` is set and points somewhere real, that the docs gate rejects a staged source file with no matching doc and names the right one, that `src/pages/*` maps into `docs/components/` and not a `docs/pages/`, that vendored `src/components/ui/**` and test files are exempt, that the test-output gate denies an unredirected run and hands over a usable replacement, and that it leaves the working tree exactly as it found it.

Proven to fail when it should: unsetting `core.hooksPath` makes it exit 1 with the recovery command in the message, and `npm run setup-hooks` restores a clean run.

**Rejected: a fresh-session "drift test."** The idea was to have a new session perform scripted actions, with the test's *purpose* withheld so it couldn't game the result. It doesn't work. CLAUDE.md documents the enforcement, so a fresh session knows about it before reading any test file — blinding would require removing that documentation. More fundamentally, drift is a property of *long, distracted* sessions where an instruction read hundreds of messages ago competes with everything since; a fresh session has CLAUDE.md at maximum salience and is following an explicit checklist, which is the condition under which drift does not occur. The test would pass and the pass would mean nothing. The hook's blocking behaviour is already directly evidenced (it blocked a real commit with missing docs during implementation), and being a shell script it cannot drift — so a regression test of the wiring is the right instrument.

The one cold-start check still worth running needs no blinding: can a session with no memory of the design act on the block message — find `update-docs` → *Delegating*, and produce a correctly sized why-brief? That tests comprehension of durable artifacts rather than memory, so its purpose can be stated outright.

## Rejected: an orchestrator with a dev → test → docs agent chain

The original idea. Rejected for three reasons:

1. **Cold starts triple the work.** Each subagent spawns with no conversation context, so the test and docs agents each re-read every changed file from scratch.
2. **It destroys the *why* in docs.** The valuable content here — "this flex structure exists because mixing font-size utilities misaligned, since each bundles its own `line-height`" — comes from live debugging, not from the final diff. A cold agent would document *what*, not *why*.
3. **It hides the teaching.** This project is a learning vehicle (see CLAUDE.md). Subagent transcripts are not shown to the user, so delegating implementation moves every explanation somewhere they never see it.

The general principle behind all three: **artifacts serialize to disk; understanding does not.** Handing an agent a log file is nearly free. Handing it "make this feature work" is not.

## Rejected: a test-triage agent

Designed, then rejected. It would have run the suite and reported failures deduped by root cause.

- **Mediation cannot beat 6 lines.** `tail -6` on a redirected log gives the exact failure count. No agent report is cheaper, and every reply lands in the main context anyway.
- **Dedup fights fixing.** "All 16 failures are missing `definition`" flattens the fact that some tests mock inline and others use a shared factory — so the fix addresses one, the re-run still fails, and the compression *caused* an extra round trip. Dedup suits orientation; a fix loop is all execution.
- **`grep` already does it.** The agent would wrap a cheaper primitive with worse fidelity (no drill-down) and added coordination.

**Fixing is never delegated**, and that is a correctness argument, not just a cost one. Deciding *regression vs. stale assertion* (see [reading-test-output.md](./tests/reading-test-output.md)) requires knowing what the change intended — which lives only in the conversation. A cold agent sees "component changed, tests fail" and may restore the old markup, silently reverting a deliberate redesign.

## The three agents that survived

Chosen on one criterion: does the task *benefit* from a cold start or output isolation, or suffer from it?

- **`diff-reviewer`** — read-only. Cold start is a feature: an agent that has not seen the author's reasoning gives an independent read instead of rubber-stamping. Its false positives are the accepted price.
- **`docs-auditor`** — write-capable, the one exception. Doc prose is output-heavy, so generating it in a subagent is a real saving, and it is safe *because the decision content arrives with the task* (a why-brief from the caller) rather than being derived by the agent.
- **`ui-designer`** — read-only (`tools: Read, Grep, Glob, Bash, Skill, mcp__playwright`), invoked by the `build-ui` skill. A visual-design decision (color, spacing, layout, icon, component structure) benefits from the same cold-start independence as `diff-reviewer`, but the risk is different: the agent still holds `Bash` and `Skill`, either of which could write a file by another route even without `Edit`/`Write` (a shell redirect, `sed -i`, or a vendored design skill's own `--persist`/write flags). The `tools:` frontmatter alone doesn't close that gap, so it's backed by the two hooks in the table above — `block-ui-designer-writes.mjs` and `block-vendored-design-skills.mjs` — rather than relying on the agent's own restraint. It decides and reports a spec; `build-ui` does the actual implementation.

The line: **read-only when the agent's output is a decision; write-capable when it is prose expansion of intent the caller supplies.** Enforced structurally via `tools:` frontmatter — and, where a decision-only agent still keeps a tool general enough to write through a side door, by a `PreToolUse` hook closing that door — not by instruction.

And the rule that generalizes all of it: **delegate decided work, never the decision.**

## Rejected: `UserPromptSubmit` for instruction priority

There is no mechanism to weight some context above the rest. Burial is two separate problems — *distance* (still present, hundreds of messages back) and *compaction* (survives only as lossy summary). Hook re-injection addresses both, since output lands at the end of context and re-fires regardless of what was summarized away.

`UserPromptSubmit` would inject on every user message — the closest thing to "always on top" — but it pays on every turn including pure conversation, and is the most banner-blindness-prone placement. Not adopted.

The better lever is **subtraction**: every rule moved into a hook can be *deleted* from CLAUDE.md, which is the only real way to make what remains more salient. That is why the Documentation system, Testing, and Database migrations sections there are now pointers rather than full rules.

## Known weak point

The learning goal is simultaneously the most valuable rule and the least enforceable — no script can verify "was this explained tutorial-style". It stays Tier 2. Evidence it genuinely gets buried: during the session that produced this system, the obligation to teach how to read Vitest output was missed entirely until the user raised it. [reading-test-output.md](./tests/reading-test-output.md) exists as a result.
