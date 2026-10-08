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

Of the 16 ADRs before this one, 12 state a revisit condition (11 of them in
force; 0007 is superseded) and 4 state none: 0003, 0005, 0006, 0008.

## Decision

### 1. One register, `method/adr-triggers.md`
One line per ADR file in `method/adr/`, superseded ones included: a link to the
ADR, its scope, its revisit trigger(s) in one line (or "none stated"), and its
**State**. The ADR's own wording is authoritative; the line is an index, not a
restatement.

**State is short, overwritten, never appended.** One of:
- `not fired`;
- `open → <item>` — the trigger fired and `<item>` handles it: a work-item ID,
  or the `## Backlog` line that will become one;
- `superseded by 00xx — not evaluated` — the whole ADR is superseded.

No evidence, no dates, no history: the evidence lives in the item that handles
the trigger, the history in git. A line that grows by appending becomes a log
nobody reads, which is the failure this register exists to fix.

**Supersession.** A superseding ADR restates, in its own text, every trigger of
the old ADR it keeps; the old line's trigger is never inherited silently. The
item that lands the superseding ADR sets the old line's State to
`superseded by 00xx — not evaluated` and adds the new ADR's line. An ADR only
*partly* superseded (its header says "Supersedes part of", as 0004 does for
0003) keeps an ordinary State: its in-force parts are still evaluated.

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
adds the ADR; for an ADR with a `## Revisit when` section (§5) the line states
each trigger of that section with where its evidence appears ("seen in …"), and
does not repeat the premises, which §5 has already turned into triggers. A trigger's text changes only when its ADR is
superseded. A State changes only in a work item's own diff: `open → <item>` and
its later overwrite (`not fired` again if the revisit keeps the ADR as it is,
`superseded by …` if it replaces it) are written by the item that handles the
trigger. Until that item exists, the confirmed `## Backlog` line (§3) is the
routing, and QA reads it as such. The initial state was recorded by T7.

### 2. QA evaluates it at every verdict
Every QA verdict, story or task, READY or BACK TO, carries
`triggers fired: none` or `triggers fired: ADR-00xx[, …]` with the observed
evidence for each. QA reads the register against the diff and the item's
evidence. It:
- **skips** a line whose State is `superseded by 00xx — not evaluated`: what
  the superseded ADR still meant is the superseder's to restate;
- **evaluates** the in-force parts of a partly superseded ADR, and only those;
- **does not report again**, without new evidence, a trigger whose State is
  `open → …` or that a `## Backlog` "Revisit ADR-00xx" line or a `## Spotted`
  rejection already names;
- **marks** a trigger `caused by this branch` when the evidence is the diff or
  its merge itself, not something observed while doing the work (§3 case c);
- **checks**, when the diff adds an ADR, that its `## Revisit when` triggers are
  observable (each names where its evidence would appear) and that its uncertain
  premises are stated as triggers (§5) — CI can only check the section exists.

QA judges only whether a trigger fired, never what to do about it.

### 3. Three cases, kept apart
- **(a) A diff that contradicts an in-force ADR never reaches `develop`.** That
  is not a trigger; it is a FAIL
  ([ADR-0016](0016-contradictions-flagged-and-where-rules-live.md) §4,
  `CLAUDE.md` rule 8). It is fixed on the branch, or a superseding ADR lands in
  the same item, or the work is rejected.
- **(b) A fired trigger is evidence to re-examine an ADR**, not a verdict on
  it. It is routed to the backlog and does not block the merge. At READY FOR
  ALEX, `closeout.md` drafts, for each ADR in QA's line, a one-line
  `## Backlog` entry, "Revisit ADR-00xx", with the trigger, the evidence, and
  the architect as owner. Alex confirms or rejects it. Confirmed, it is
  committed on the item's own branch as `<ID>: backlog — …` before the merge, as
  a planning edit
  ([ADR-0014 §6](0014-work-item-types.md#6-only-a-merged-pr-reaches-develop)).
  Rejected, a `## Spotted` line records his reason, so the same evidence is not
  raised again. The revisit item decides what happens to the ADR.
- **(c) When the branch itself causes a trigger to fire, Alex decides before
  the merge.** Example: ADR-0004's "more than two undemoed stories sitting on
  `develop`", where merging this PR is what makes it three. Routing it to the
  backlog would let the merge create the very state the ADR warns about. The
  closeout presents it as a decision, not a drafted entry: hold the merge (for
  ADR-0004, demo first), change the branch so it no longer fires, or merge
  knowing it fires — and then it is case (b), drafted as a revisit entry with
  his reason.

### 4. CI keeps the register complete
`method/check-adr-register.mjs`, dependency-free node with `node:test` tests,
fails when:
- an ADR in `method/adr/` has no register line, a register line points to no
  ADR (a number or a link with no file behind it), or an ADR has two lines;
- an ADR numbered 0017 or above has no `## Revisit when` section, or an empty
  one.

It runs in its own workflow, `.github/workflows/adr-register.yml`,
path-filtered to the ADR directory, the register, the script, its tests and the
workflow, so it runs on any PR that adds an ADR. The tests cover each failure
and the script's exit code, run as a child process.

**The section cutoff is 0017, not 0018.** ADRs up to 0016 are frozen and never
gain the section ([ADR-0015](0015-adr-lifecycle.md) §2). This ADR is still a
draft (§1 of ADR-0015), so it is written with the section rather than exempted
from the rule it makes, and the check has a real instance from its first run
instead of passing vacuously until someone writes 0018.

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
stated here rather than hidden. The section check rests on the second observed
failure, ADR-0007: a premise that had no place to be written, so it was not.
The check proves the place exists; whether what is in it is observable is QA's
reading (§2).

Why its own script and workflow, and not an extension of
`method/check-closeout.mjs`:
- that script is one top-level pass with no exports and no tests; extending it
  testably means restructuring it, which is not this item's work, and extending
  it untestably is what this item's criteria forbid;
- its workflow is path-filtered to the backlog and the logs by
  [ADR-0012](0012-ci-check-for-story-closeout-artifacts.md)'s decision, and a red
  `closeout` X would then name two different failures — the reason ADR-0016 §3(c)
  gave its own check its own workflow.

No new dependency: `node:test`, `node:assert` and `node:child_process` ship
with node.

### 5. New ADRs write their premises as triggers
From this ADR on, every ADR has a `## Revisit when` section, after its
trade-off: each uncertain premise written as a trigger ("assumes X; revisit if
X is false"), and each trigger naming where its evidence would appear (a QA
verdict, a log, a CI run, the phone, the backlog). The register line states
each trigger with its "seen in"; premises are not repeated there.
The rule lives in `.claude/agents/architect.md`, beside the ADR template.
Frozen ADRs are not normalised to it.

## Trade-off
**Frozen ADRs are indexed by their stated triggers only.** ADR-0007's failure
was an unstated premise; for the 16 ADRs before this one the register would not
catch that either, and writing their premises down would be a rewrite of frozen
ADRs. §5 closes the gap for new ADRs only. Signal to revisit: an ADR is again
found wrong by a premise its trigger did not name. If it is a frozen one, that
ADR is superseded with a `## Revisit when` section of its own, case by case; if
it is a new one, §5's rule is not being followed and QA's §2 check missed it.

**QA's evaluation is a reading, and readings go stale.** `triggers fired: none`
can become a line written by rote. The CI check proves the register is complete,
never that anyone read it. Signal: a trigger is later found to have fired before
a verdict that said `none`. Then the evaluation is not happening, and the next
step is structural (for example, QA quoting the evidence it checked for each
trigger), not more wording.

**The register lags the backlog.** Between Alex confirming a "Revisit ADR-00xx"
line and the item that handles it, the register still says `not fired`; only
that item's diff may change it, since a planning edit is confined to
`## Backlog` and `## Spotted`. A reader of the register alone misses it; QA
reads both. Signal: a trigger reported twice for the same evidence, or a
decision taken on a `not fired` the backlog contradicted.

**The planning commit for a confirmed revisit lands after QA's verdict**, so only
Alex and the `closeout` check see it, the same cost ADR-0014 §3 accepts for a
task's Done commit.

**Case (c) spends Alex's attention before a merge**, where (b) would only add a
line. It is reserved for triggers the merge itself causes, which QA marks.

**One more workflow and a second script** under `method/`, each about the size
of the closeout check. Signal: the check fires on a state we conclude is
legitimate. Then, as for ADR-0012, the rule is wrong, and the fix is to change
the rule, not the register.

**A one-line trigger compresses its ADR.** ADR-0014 and ADR-0016 carry several
conditions each, and their lines summarise them. QA must open the ADR when a
summary is close to the evidence.

## Revisit when
- *Assumes QA's evaluation happens and is not rote.* Revisit if a trigger is
  found to have fired before a verdict that said `none` — seen in a later QA
  verdict, a log, or a closeout.
- *Assumes every uncertain premise of a new ADR gets written down.* Revisit if
  an ADR is found wrong by a premise its trigger did not name — seen in a log's
  "What came back", or in the item that supersedes it.
- *Assumes the check fires only on illegitimate states.* Revisit if
  `adr-register` goes red on a PR we conclude is right — seen in the PR's checks.
- *Assumes the lag between a confirmed backlog line and the register's State is
  harmless.* Revisit if a trigger is reported twice for the same evidence, or a
  decision rests on a `not fired` the backlog contradicted — seen in QA
  verdicts and the backlog.

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
- **A State carrying the date, the evidence and where it was handled.** It grows
  by appending, duplicates the item and git, and turns an index into a log.
- **An `unrouted` state for a trigger confirmed but not yet handled.** The
  confirmed `## Backlog` line is already that pointer; a second place to keep in
  step is a second place to go stale.
- **Let the closeout set the register's State when Alex confirms a revisit.**
  It would put a non-backlog edit in a planning commit, which `CLAUDE.md`'s Git
  workflow and [ADR-0014 §6](0014-work-item-types.md#6-only-a-merged-pr-reaches-develop)
  confine to `## Backlog` and `## Spotted`, and into a story's closeout PR beyond
  ADR-0014 §2's file list.
- **QA evaluates a superseded ADR's triggers too.** A trigger the superseder did
  not restate was dropped on purpose or by mistake; either way the fix is in the
  superseder, and evaluating the old line hides which.
- **Route every fired trigger to the backlog, including one the branch causes.**
  The merge would create the state the ADR warns about before anyone decided.
- **Backfill a `## Revisit when` section into frozen ADRs.** ADR-0015 §2 freezes
  their bodies; a supersession per ADR is the only route, and none is justified
  until one is found wrong.
- **A premise field in the register, filled by the architect** — the first
  draft's answer to the unstated-premise gap. For frozen ADRs it would mean the
  architect writing premises their authors never stated into a live file beside
  a body that cannot change, so the field would be a second, unaccepted text of
  the ADR; for new ADRs, §5 already writes each uncertain premise as a trigger,
  which the register line carries. A frozen ADR found wrong by an unnamed
  premise is superseded with a `## Revisit when` section, case by case.
- **Start the section check at 0018.** It would exempt the ADR that makes the
  rule while it is still a draft, and the check would pass vacuously until the
  next ADR.
