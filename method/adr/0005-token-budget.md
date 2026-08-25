# 0005 — Session hygiene as the primary token control
**Status:** Accepted · **Date:** 2026-08-24  
**Scope:** core

## Context
Alex is paying for model usage and wants the loop to be economical without
degrading the quality signal the method depends on.

## Decision
Control cost primarily through **context discipline**, not model downgrades.
One story per session, cleared between stories; exploratory work delegated to
subagents whose context dies with them; every mechanical check pushed into CI.
Model tiering is a secondary lever, applied per role. Full detail in
[../token-budget.md](../token-budget.md).

## Reasoning
Conversation history is re-sent on every turn, so cost grows roughly
quadratically with session length. A long session is more expensive than any
model choice within it. The corollary is that a strong model on a small context
is cheaper than a weak model on a large one — which is why `dev` and `architect`
stay on opus while the *session* is kept short.

This is also why the method writes everything down. `CLAUDE.md`, the backlog and
the ADRs exist so a fresh session is productive in one message. Cheap context
resets are the payoff for the documentation discipline, not a separate practice.

## Trade-off
Clearing between stories loses useful conversational nuance, and Alex will
occasionally re-explain something. That is the intended pressure: anything worth
re-explaining twice belongs in `method/` or an ADR, where it's free forever.

The real risk is optimising the wrong thing — trimming a review to save tokens
removes the independent signal that makes AI output trustworthy at all. QA and
the phone demo are explicitly out of scope for cost cutting.
