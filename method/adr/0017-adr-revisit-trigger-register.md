# 0017 — ADR revisit triggers live in one register, read by QA at every verdict and kept complete by CI
**Status:** Proposed · **Date:** 2026-10-08  
**Scope:** core — binds to `method/adr/` as the ADR directory, to the QA
verdict format in `.claude/agents/qa.md`, and to GitHub Actions as the CI host
([ADR-0016](0016-contradictions-flagged-and-where-rules-live.md) names the same
host binding).

## Context
Most ADRs here name the condition under which they should be revisited — under
"Revisit when", "When to revisit", "Signal:", "Reopen when", or inside a
trade-off. No step of the pipeline reads them. A trigger is noticed only if
someone happens to remember the ADR at the moment the evidence appears.

Observed, not hypothetical:

- **ADR-0011's trigger fired and stayed unread.** Its signal is "a third
  occurrence in a log" of the `pipefail` slip. `method/log/S7.md` records one,
  "logged here so it counts toward ADR-0011's 'third occurrence in a log'
  signal" (2026-09-30), and `PORTING.md` repeats it as a "third-candidate".
  Eight days later no item exists for it.
- **ADR-0007's premise fell without any trigger to read.** It pinned SDK 54
  because the Play Store's Expo Go "appears to be capped at 54". That was false
  (S7, [ADR-0013](0013-expo-sdk-follows-the-store-expo-go.md)). The premise was
  never stated as a revisit trigger, so even a reader of the ADR could not have
  seen it coming; the phone found it. S7 handled it by superseding 0007.

Of the 16 ADRs at this date, 12 state a revisit condition (11 of them in
force; 0007 is superseded) and 4 state none: 0003, 0005, 0006, 0008.

## Decision

### 1. One register, `method/adr-triggers.md`
One line per ADR in `method/adr/`: a link to the ADR, its scope, its revisit
trigger in one line (or "none stated"), and its state — `not fired`, or
`fired <date> — <evidence> → <where handled>`, with `unrouted` when no item
handles it yet. The ADR's own wording is authoritative; the line is an index,
not a restatement.

**Where it lives, and why there.** Beside `closeout.md` and the DoD, the files
QA and the closeout read, rather than:
- *inside `method/adr/`* — everything there is an ADR and frozen once on
  `develop` ([ADR-0015](0015-adr-lifecycle.md)); the register's state fields
  change, and a live file among frozen ones invites a misread or an exemption;
- *inside each ADR* — ADR bodies are frozen, and four ADRs have no trigger to
  carry;
- *in `app/backlog.md` or `PORTING.md`* — the backlog is the app's and ports
  differently; PORTING is about scope, and the check would have to parse prose
  written for another purpose.

**Who writes it.** The architect. A new ADR adds its line in the commit that
adds the ADR. A trigger's text changes only when its ADR is superseded; a
line's state changes only in the work item that handles the trigger. Its
initial state was recorded by T7.

### 2. QA evaluates it at every verdict
Every QA verdict, story or task, READY or BACK TO, carries
`triggers fired: none` or `triggers fired: ADR-00xx[, …]` with the observed
evidence for each. QA reads the register against the diff and the item's
evidence. A trigger the register shows as `unrouted` is reported until an item
handles it; one already handled (a `→` to an item, or a `## Backlog` /
`## Spotted` entry naming it) is not reported again without new evidence. QA
judges only whether a trigger fired, never what to do about it.

### 3. The closeout turns a fired trigger into a drafted item
At READY FOR ALEX, `closeout.md` drafts, for each ADR in that line, a one-line
`## Backlog` entry, "Revisit ADR-00xx", with the trigger, the evidence, and the
architect as owner. Alex confirms or rejects it. Confirmed, it is committed on
the item's own branch as `<ID>: backlog — …` before the merge, as a planning
edit ([ADR-0014 §6](0014-work-item-types.md#6-only-a-merged-pr-reaches-develop)).
Rejected, a `## Spotted` line records his reason, so the same evidence is not
raised again. A trigger firing is a reason to re-read an ADR, not a verdict on
it; the revisit item decides.

### 4. CI keeps the register complete
`method/check-adr-register.mjs`, dependency-free node with `node:test` tests,
fails when an ADR in `method/adr/` has no register line, when a register line
points to no ADR (a number or a link with no file behind it), or when an ADR has
two lines. It runs in its own workflow, `.github/workflows/adr-register.yml`,
path-filtered to the ADR directory, the register, the script, its tests and
the workflow, so it runs on any PR that adds an ADR.

**The mechanism, per [ADR-0016](0016-contradictions-flagged-and-where-rules-live.md) §2.**
The observed failure is the one in Context: a revisit condition that no step
reads. An ADR missing from the register is that same failure again, for that
ADR, because QA reads the register and not the directory. Where it happens is
the PR that adds the ADR, so the cheapest mechanism that catches it there is a
CI check. It binds every actor, unlike a harness hook, which binds only agents.
It checks a machine-checkable invariant, which is the narrow kind of check
ADR-0016 §4 allows. What it does not have is an observed instance of its own
failure, an ADR merged without a register line, because the register did not
exist before. That is the gap between this check and the letter of ADR-0016 §2,
stated here rather than hidden.

Why its own script and workflow, and not an extension of
`method/check-closeout.mjs`:
- that script is one top-level pass with no exports and no tests; extending it
  testably means restructuring it, which is not this item's work, and extending
  it untestably is what this item's criteria forbid;
- its workflow is path-filtered to the backlog and the logs by
  [ADR-0012](0012-ci-check-for-story-closeout-artifacts.md)'s decision, and a red
  `closeout` X would then name two different failures — the reason ADR-0016 §3(c)
  gave its own check its own workflow.

No new dependency: `node:test` and `node:assert` ship with node.

## Trade-off
**It indexes stated triggers only.** ADR-0007's failure was an unstated
premise; this register would not have caught it either. Writing every premise
down as a trigger would be a rewrite of frozen ADRs. Signal to revisit: an ADR
is again found wrong by a premise its trigger did not name. Then the register
gains a premise field, filled by the architect.

**QA's evaluation is a reading, and readings go stale.** `triggers fired: none`
can become a line written by rote. The CI check proves the register is complete,
never that anyone read it. Signal: a trigger is later found to have fired before
a verdict that said `none`. Then the evaluation is not happening, and the next
step is structural (for example, QA quoting the evidence it checked for each
trigger), not more wording.

**The planning commit for a confirmed revisit lands after QA's verdict**, so only
Alex and the `closeout` check see it, the same cost ADR-0014 §3 accepts for a
task's Done commit.

**One more workflow and a second script** under `method/`, each about the size
of the closeout check. Signal: the check fires on a state we conclude is
legitimate. Then, as for ADR-0012, the rule is wrong, and the fix is to change
the rule, not the register.

**A one-line trigger compresses its ADR.** ADR-0014 and ADR-0016 carry several
conditions each, and their lines summarise them. QA must open the ADR when a
summary is close to the evidence.

## Alternatives rejected
- **Leave the triggers in the ADRs and rely on readers.** That is the status quo
  the Context records failing.
- **Generate the register by parsing the ADRs.** The conditions sit under five
  different headings or inside a trade-off paragraph; a parser would be the
  keyword check [PORTING.md](../PORTING.md) rejected for firing on correct states.
- **Extend `check-closeout.mjs`, or add a job to `closeout.yml`.** See §4: no
  tests to extend, and a shared path filter and red X.
- **A git pre-commit hook or a `PreToolUse` hook.** It binds agents or one
  clone only, and is bypassed with `--no-verify`; ADR-0016 §2 prefers the
  mechanism that binds every actor.
- **QA checks completeness by hand at each verdict.** That is a mechanical
  invariant handed to a reader, who has no reason to look for a line that is
  missing.
- **Act on the triggers already fired while building the register.** Each is
  its own decision; the register records them and the closeout routes them.
