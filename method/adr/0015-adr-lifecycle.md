# 0015 — An ADR is a draft until it reaches `develop`, and frozen after
**Status:** Accepted · **Date:** 2026-10-07  
**Scope:** core — binds to `develop` as the branch meaning "the machine and QA
believe it" ([ADR-0004](0004-git-flow-branching.md)); a project with another
integration branch substitutes it.

## Context
No ADR said when an ADR's text may change. Two practices grew without one:

- **Amendments appended to an unmerged ADR.** An ADR corrected on its own
  branch, before it reached `develop`, gained an "Amendment 1" section: a second
  Context, Decision, Trade-off and Alternatives block, plus the story of how the
  first draft was replaced. A reader had to replay the original and then the
  amendment to know what was in force, and other method files cited the
  amendment as if it were a separate decision.
- **Edits to ADRs already on `develop`.** Some were header-only (304be16 added
  the `Scope:` line to 0001–0012; a1d5207 marked 0007 superseded). Others
  repointed a stale fact to its superseder (a1d5207, 0007's "How to verify" and
  0009's "SDK 54" line). None changed a decision, but nothing said which edits
  are allowed, so nothing would stop one that did.

Two goals decide it: correctness — a reader must not replay history to know
what is in force — and portability, since the method is meant to be lifted into
other repos ([PORTING.md](../PORTING.md)), where an ADR full of this project's
review narrative is archaeology. 0013 superseding 0007 is the model for changing
a decision that is in force.

## Decision

### 1. Before `develop`: a draft, consolidated
Until the PR that carries it is merged to `develop`, an ADR is a **draft**, even
if Alex accepted it at a gate. A correction — from QA, from Alex, from an
outside review — is **folded into the text**, and the ADR is written as one
clean version, as if it had been right the first time. No "Amendment N"
sections. The history is in git and on the PR, which is where it belongs.

Consolidation:
- **keeps** every decision, every trade-off and its revisit signal, and every
  rejected alternative — including those born in a correction (for ADR-0014:
  the file-equivalence check, the `demo/S<n>` tag);
- **drops** narrative (who found what, the first draft, which reviewer chose
  what), applied-edit checklists, and intermediate statuses.

### 2. On `develop`: frozen, superseded
Once on `develop`, an ADR's body is never edited. A changed decision is a new
ADR that supersedes it, in whole or in part (0013 → 0007; 0004 → part of 0003).
The only edits allowed to an in-force ADR are:
- its **header lines** — `Status:` (e.g. "Superseded by …"), `Scope:`, and
  supersession links;
- **repointing a reference** whose target was superseded, to its superseder.

Anything else, however small, is a superseding ADR.

### 3. Numbers are taken, not reserved
An ADR takes the next free number on `develop` when its draft is written. No
number is reserved ahead: a forward reference names the work item ("T1's ADR"),
not a number.

### 4. The consolidation has its own QA check
When an ADR is consolidated, QA compares the consolidated text against the
last pre-consolidation version (`git show <sha>:<path>`) and reports, for each
decision, trade-off and rejected alternative of the old text, where it now
lives. Any one lost or changed is a FAIL. Rewording is allowed; changing what is
decided is not — a changed decision is a new correction, and goes back to Alex.

## Trade-off
**Git and the PR become the only record of how an ADR got its shape.** A reader
who wants to know why an alternative was rejected late, or what a reviewer
objected to, must open the PR, not the ADR. The decision and its rejected
alternatives survive; the story does not. Signal to revisit: someone needs the
history twice and the PR is gone or unreadable — then a short "History" section
earns its place.

**Consolidation is a rewrite, and a rewrite can drift.** The QA check in §4 is
the guard; it is a reading, not a machine diff, so it can miss a nuance. Signal:
a consolidated ADR is later found to state less than what Alex accepted.

**A frozen ADR keeps its stale facts.** A wrong number or an outdated command in
an in-force ADR stays wrong until a superseding ADR is written, or a pointer can
be repointed. That is the price of "what is on `develop` is what was decided".
Signal: superseding ADRs written only to fix a typo — then a narrow erratum rule
is the next thing to try.

## Alternatives rejected
- **Amendments appended inside the ADR.** The reader replays history; other
  files cite amendments as if they were decisions of their own.
- **Edit in-force ADRs freely and rely on `git log`.** `develop` would no longer
  tell you what was decided when; any edit could change a decision silently.
- **Freeze at Alex's acceptance rather than at `develop`.** Acceptance happens
  before QA has read the applied edits, which is exactly when corrections
  arrive. Freezing there forces amendments — the thing this rule removes.
- **A "History" section in every ADR.** Narrative is what makes ADRs costly to
  port; git already holds it.
- **Reserve numbers for planned ADRs.** A plan changes and leaves a hole or a
  renumbering; naming the work item does not.
