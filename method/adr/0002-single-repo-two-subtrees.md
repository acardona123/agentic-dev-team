# 0002 — One repo, structured as two subtrees
**Status:** Accepted · **Date:** 2026-08-24  
**Scope:** core

## Context
This project has two products: a **reusable method** for running AI agents as a
dev team, and an **example app** (Almost There) used to develop and test that
method. Alex's instinct was two GitHub repos, since they are conceptually
distinct things with different audiences.

## Decision
One repository, internally split into two subtrees:
- `CLAUDE.md` + `.claude/agents/` + `method/` — the method
- `app/` — the example app, including its own backlog

## Reasoning
Conceptual distinctness is the criterion for a *directory* boundary. The
criterion for a *repo* boundary is whether the thing ships, versions and changes
independently — which the method does not yet do.

Two mechanical facts drove this:

1. **`.claude/agents/` only loads from the root of the working directory.** In a
   separate method repo those files would be inert while working on the app;
   they would have to be copied into the app repo to function, creating two
   copies that drift apart the first time a role is tightened after a bad
   review. `CLAUDE.md` and the agent files are the executable form of the
   method, so they must live where the work happens.

2. **The method is a hypothesis, not yet general.** It becomes general by being
   tuned against this app. Generalisation is the output of this project, not its
   input. The version worth publishing is the one that can say "this rule exists
   because in S2 the dev agent did X and QA missed it."

## Trade-off
A standalone app repo reads better as a portfolio piece, and "we'll split it
later" is a promise projects routinely fail to keep. We accept that risk because
the split is cheap to perform and expensive to reverse:

```bash
git subtree split --prefix=app -b almost-there-only   # full history preserved
```

Merging two repos back together with interleaved history is far worse than
splitting one. Cheap-to-reverse beats cheap-to-do.

## When to revisit
Alex chose not to fix a trigger date. Signals that the repo has become cramped:
the app gains a user, a contributor, or a release that isn't Alex; CI needs to
differ per subtree; or the method stabilises enough to be reused on a second
project (at which point the *method* is what gets extracted, as a template).

## Alternatives rejected
- **Two repos + submodule** — detached HEAD, stale pointer commits and forgotten inner pushes would cost hours on a problem orthogonal to what Alex is here to learn.
- **Two fully separate repos** — agents lose cross-visibility; the dev agent could not read a story and write the code in one working directory.
