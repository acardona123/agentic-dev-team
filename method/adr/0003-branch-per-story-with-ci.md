# 0003 — One story, one branch, one PR, with CI as the gate
**Status:** Accepted · **Date:** 2026-08-24

## Context
Alex works solo, so branches and pull requests look like pure ceremony. The
Definition of Done requires a machine gate (`typecheck`, `test`, `lint`) that
the dev agent currently runs and self-reports.

## Decision
Every story gets a branch `story/S<n>-<slug>` and a pull request. GitHub Actions
runs the machine gate on every PR touching `app/`. Agents may commit to the
story branch; only Alex merges.

## Reasoning
1. **The PR makes the review gate permanent.** QA's verdict stops being terminal
   output that scrolls away and becomes a comment attached to the exact diff it
   judged.
2. **`git diff main...HEAD` is a hard scope boundary.** Scope creep is the
   failure mode that makes AI output unreviewable. A story branch turns "did
   this stay in scope?" from a judgement call into a readable diff.
3. **CI moves the gate from claimed to enforced.** Self-reported test results
   are a trust assumption about the party with an incentive to pass. A required
   check removes the question. You don't ask the developer whether it compiled —
   you look at the build server.

## Trade-off
A few `gh` commands per story, and CI minutes. Also a real failure mode to watch:
a green CI badge invites you to skip reading the diff. CI proves the code runs,
never that it does the right thing — the phone demo remains mandatory.

## Alternatives rejected
- **Commit straight to main** — simplest, but loses both the scope boundary and the enforced gate, which are the two things that make AI output reviewable at speed.
- **Branch + PR without CI** — keeps the boundary, keeps the trust assumption. Half the value for most of the effort.
