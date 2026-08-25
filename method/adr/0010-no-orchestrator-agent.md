# 0010 — The dispatching session has no role file; no orchestrator subagent
**Status:** Accepted · **Date:** 2026-08-25  
**Scope:** core

## Context
Four roles live in `.claude/agents/`: `po`, `architect`, `dev`, `qa`. The fifth
participant — the session Alex actually types at, which spawns the other four —
had nothing governing it. The standing rules were headed "all agents", which the
dispatching session need not read as covering itself, and nothing on paper
stopped it from implementing a story directly instead of routing it to `dev`.
That silently removes "the reviewer is not the author", which is most of what
makes the `qa` verdict worth anything.

The prompting incident was small and characteristic: the dispatching session
recommended Alex run the phone demo on S1 before QA had reviewed it, and offered
QA afterwards as an option. The pipeline already fixes that order in three
places — [manager-playbook.md](../manager-playbook.md) step 6 before step 7,
[definition-of-done.md](../definition-of-done.md)'s review gate before its human
gate, and [ADR-0004](0004-git-flow-branching.md)'s meaning for `develop` — and
the session had read none of them. It was recommending from memory. The
dispatcher is the participant most exposed to that failure, because it is the
only one that speaks without a role file telling it what to read first.

The obvious fix — write `.claude/agents/orchestrator.md` — was considered and
rejected.

## Decision
The dispatching session is governed by `CLAUDE.md` itself and deliberately has
**no** role file. `CLAUDE.md` gained a `### The session Alex is typing at` block
stating its job, the standing-rules heading was widened to name it, and rules 8
and 9 were extended to bind it. No orchestrator subagent exists or will be added.

## Reasoning
Three arguments, in the order they actually carry weight.

1. **A role file there would not run.** `.claude/agents/*.md` defines
   *subagents*: something spawns them, they run to completion, they return a
   report. The dispatching session is not spawned by anything, so no file in
   that directory can configure it. An `orchestrator.md` would take effect only
   if some session spawned an orchestrator subagent — at which point the file
   governs that child, not the session Alex is talking to. In link terms it is a
   symbol nobody references: it compiles, it ships, it is never called.

2. **An orchestrator subagent would be actively wrong, not merely useless.**
   Alex's two gates — approving acceptance criteria (playbook step 3) and the
   phone demo (step 7) — are interactive by construction. A subagent cannot hold
   a conversation; it can only return a report. So an orchestrator either runs
   past both gates on its own judgement, which is exactly the failure this ADR
   exists to prevent, or it bounces every question back through the parent
   session, which is the parent doing the work with an extra frame on the stack.
   This is the deciding argument.

3. **Nesting costs context and distance.** Delegation is not free
   ([ADR-0005](0005-token-budget.md)), and an orchestrator puts a layer between
   Alex and the specialists whose reports he needs to read cold. Worth stating,
   but honestly: cost alone would not have settled this. If the gates were not
   interactive, argument 3 on its own would be a preference, not a decision.

## Trade-off
`CLAUDE.md` is loaded into every session *including every subagent*, so rules
that apply only to the dispatcher are paid for in `po`'s, `architect`'s, `dev`'s
and `qa`'s context on every run — the exact cost [ADR-0005](0005-token-budget.md)
tells us to watch. A role file would have been the cheaper home for them. We are
buying enforceability with tokens, and today the bill is about thirty lines.

The larger cost: this rule is self-enforced. The machine gate is CI — nothing
can talk it out of a red check. Nothing mechanically prevents the dispatching
session from implementing a story itself or proposing a gate out of order; the
only detector is Alex noticing, which is the same attention the method is trying
to conserve.

Revisit if either of these shows up:
- The dispatcher block outgrows roughly a screen, or starts accumulating
  procedure rather than constraints. At that point move the detail into
  `method/manager-playbook.md` and leave a pointer, so the subagents stop
  carrying it.
- A second gate-order or self-implementation slip after this is in place. That
  would mean prose in `CLAUDE.md` is not a strong enough mechanism, and the fix
  is mechanical — a pre-commit hook or a CI check that fails a `develop` commit
  touching `app/` without a `story/` branch and a QA comment — not more prose.

## Alternatives rejected
- **`.claude/agents/orchestrator.md`** — cannot configure the session Alex types
  at; only takes effect if spawned, and a spawned orchestrator cannot hold
  either of Alex's gates.
- **Leave the dispatcher ungoverned** — status quo. It is the participant with
  the widest view of the loop and therefore the only one positioned to reorder
  the pipeline by accident, which is what happened on S1.
- **Put the dispatcher rules in `method/manager-playbook.md` only** — cheaper on
  every agent's context, but the playbook is not auto-loaded, so a fresh session
  would not read it before its first recommendation. Same failure as S1, with
  the rule written down somewhere nobody looks.
