# 0014 — Two work-item types: story and task
**Status:** Accepted (by Alex, 2026-10-07) · **Date:** 2026-10-07  
**Scope:** core — binds to `app/backlog.md` (where items live) and to what
"demo" means for a story ([PORTING.md](../PORTING.md) substitution table).

## Context
The method knows one kind of work: the story, which ends in a phone demo
(`CLAUDE.md` rules 1 and 4, [definition-of-done.md](../definition-of-done.md),
`po.md` "A story must be demonstrable on the phone"). Everything else the
project needs — ADRs, `## Spotted` triage, method edits, a README — has no
container. Two observed consequences:

- `git log` holds a dozen `Method:` commits made straight on `develop`, with no
  work item, no branch and no PR — so none of them was reviewed by anyone but
  its author, and [ADR-0004](0004-git-flow-branching.md)'s meaning for `develop`
  ("the machine believes it works — CI green, QA passed") was not true of them.
- `## Spotted` is headed "Triage these yourself". Every agent therefore deferred
  triage to Alex, and the advisory re-triage noted there sat unowned.

Alex's rule (S7 closeout, 2026-09-30): **every operation is motivated by a
tracked work item; if a needed task fits no type, the type definitions are
wrong.** The research recorded under "Method gap" in `## Spotted` (2026-10-07)
confirms the existing core — writer ≠ reviewer in a fresh context, one writer
at a time, machine gate before the human, state in the repo — and warns
against over-building. So: the minimum that gives non-story work a container
and a reviewer, nothing more.

## Decision

### 1. Two types, no others

| | **Story** `S<n>` | **Task** `T<n>` |
|---|---|---|
| What it is | A thin vertical slice of app behaviour | Work that changes nothing in the app the phone runs: an ADR, a method or role-file edit, Spotted triage, docs, CI for method checks, a change to the machine or the hosting (dev-box setup, branch protection) |
| Written by | `po` | `po` |
| Approved by | Alex, on the AC (playbook step 3) | Alex, on the completion criteria (same step) |
| Done when | Its AC pass and Alex saw it on the phone | Its **completion criteria** — each a diff criterion or a world-state criterion (below) — are met, and Alex confirmed the deliverable |
| Produced by | `dev` | The **owning role**: `architect` for ADRs and build config, `po` for backlog and story-shape text; anything else is named in the task |
| Reviewed by | `qa`, per AC | `qa`, per completion criterion: a diff criterion against `git diff develop...HEAD`, a world-state criterion by re-running its read-only observation where a machine can — writer ≠ reviewer applies to method work too |
| Human gate | Merge to `develop`, phone demo, `main` fast-forward ([DoD](../definition-of-done.md) order) | Alex reads the deliverable, confirms it, witnesses any world-state criterion QA could not observe, and merges the PR. No demo. |
| Branch | `story/S<n>-<slug>` | `task/T<n>-<slug>`, cut from `develop`, PR to `develop` |
| Commits | `S<n>: …` | `T<n>: …` |
| Backlog | `## Ready` … `## Done` | `## Tasks`, each `### T<n> — title` with a `**Status:**` line (Ready / Doing / Review / Done) |

**Completion criteria come in two kinds.** Some tasks act only on the world
outside the repo and leave no natural trace in a diff — in this project, S7's
WSL2 mirrored networking and `libasound2` fix, branch protection on
`develop`/`main`, the Expo Go version on the phone. So each criterion is one of:

- **Diff criterion** — QA checks it in `git diff develop...HEAD`, as for any
  change.
- **World-state criterion** — the deliverable is a **dated record of the
  observed state**: the observation command or procedure, and its result. It is
  written under that criterion in the task's own block in `## Tasks`, so it
  lands in the task's diff and sits beside the claim it proves. If the
  observation is machine-runnable from the repo machine (`gh api …`,
  `dpkg -s libasound2`), QA re-runs it read-only and compares; if it is not
  (something on the phone), Alex witnesses it at his gate, as for a demo.

Either way every task leaves a trace in the repo, which stays the only source of
truth. The distinction is written down only — no tooling and no CI enforce it.

**The boundary that keeps rule 4 intact:** a task never changes the app the
phone runs. If a task's diff needs to touch `app/src/` or the app's runtime
dependencies, it is a story, with AC and a demo. QA names a breach as scope
creep. Without this line, "task" becomes the way to do the "build the data
layer" work rule 4 forbids.

**Tasks reach `main` only by riding the next demoed fast-forward.** `main` keeps
[ADR-0004](0004-git-flow-branching.md)'s single meaning — "Alex saw it work on a
real phone" — and is never moved for a task alone. A task changes no phone
behaviour, so carrying it inside the next demo's fast-forward does not make
`main` claim anything untrue.

### 2. Spotted triage is routed, not deferred
The dispatching session routes each `## Spotted` entry to the role that owns its
subject (`architect` for technology and config, `po` for product and backlog
shape, `qa` for review findings; an entry that fits no role goes to `po`).
That role returns a **verdict**: no action
(with the reason), becomes a task, or becomes a story candidate. Alex confirms or
rejects the verdict; he does not do the triage. The verdict is written into the
entry, as the 2026-08-25 triages already are. Routing is dispatch, which the
session may do; producing the verdict itself would be the session standing in
for a role, which `CLAUDE.md` forbids it.

### 3. The PO orders the backlog
The PO owns the order of everything not yet in flight — stories and tasks alike
— in addition to writing them. Order is expressed in one place, the
`## Backlog` list, where unrefined stories and tasks sit as one-line entries;
the top entry is next. Refined task blocks live under `## Tasks`.

### 4. Bootstrap exception — this ADR's own work
The work that writes this ADR and applies its edits could not be a task, because
the type did not exist yet. It runs under the "Method gap" entry in `## Spotted`
as its work item, on branch `method/work-items`, with a PR to `develop`. This is
the one exception. From the merge of that PR on, **no commit lands on `develop`
except through a merged `story/` or `task/` PR**; the `Method:` commits straight
on `develop` stop. The four follow-ups queued in that entry become T1–T4.

## Trade-off
**More ceremony per small edit.** A one-line method fix now costs a backlog
entry, a branch, a QA run and a merge. That is the price of every change
having a reviewer, and it is paid in agent tokens and one Alex read, not in
Alex's typing. Signal to revisit: Alex starts batching unrelated edits into one
task to dodge the overhead — then the type is too heavy, and a "trivial task"
lane (QA only, no PO step) is the next thing to try.

**A task has no machine gate of its own.** `gate.yml` is path-filtered to
`app/**` minus markdown, and `closeout.yml` sees only the backlog and logs, so a
task touching only `method/` gets no CI signal beyond the closeout check. QA is
the whole review. Accepted for now: ADR-0015 (T1) adds a CI check that runs on
every PR. Revisit if that check does not land, or when a task first ships
executable method code (as `check-closeout.mjs` is) without a test.

**`main` lags `develop` by every task since the last demo.** Method edits are
invisible on the default branch until the next story is demoed. Accepted:
[ADR-0004](0004-git-flow-branching.md)'s meaning for `main` wins. Signal: a fresh
session or a porting attempt reads stale method from `main`. Then tasks get their
own promotion rule, which this ADR deliberately does not invent ahead of need.

**A world-state record is a snapshot, not a guarantee.** It proves what was
observed on its date; the machine or the GitHub setting can drift the next day,
and nothing re-checks it. A criterion only Alex can witness rests on his
attention, exactly as a demo does. Signal: a recorded state is found false when
a later item relies on it — then that observation earns a check of its own.

**Triage still costs Alex a confirmation per entry**, and a role-produced verdict
can be wrong in the way its role is blind. Cheaper than him doing the triage,
which is what was not happening.

## Alternatives rejected
- **More types (spike, bug, chore, epic).** A bug in phone behaviour is a story
  — it ends in a demo; anything else is a task. No observed item in S0–S7 fitted
  neither. Add a type when one does.
- **Sprints and their ceremonies** (planning, review, retro, velocity). They
  coordinate several humans working in parallel; here one item is in flight and
  the backlog order already says what is next. Anthropic's own long-running-agent
  harness dropped its sprint decomposition as scaffolding the model no longer
  needed. Nothing in S0–S7 failed for want of a sprint. The per-story log is
  already the retro.
- **GitHub Issues as the work-item store.** Issues would be a second copy of the
  state, kept in sync by hand or by tooling — the opposite of "the repo is the
  only source of truth" — and would bind a `core` method to one host. The one real
  need behind them, "every PR references a work item", is checkable in CI against
  `backlog.md` itself by extending `method/check-closeout.mjs`
  ([ADR-0012](0012-ci-check-for-story-closeout-artifacts.md)). Without Issues we
  lose a clickable progress board; `app/backlog.md` rendered on GitHub is the
  board.
- **Leave method work outside the work-item system.** Status quo; produced the
  unreviewed `Method:` commits on `develop` and the unowned Spotted queue.
- **A third type for real-world tasks** (machine setup, hosting settings,
  device state). The work differs only in where its proof comes from, which is
  a property of one criterion, not of the item — a single task can mix both
  kinds. Two kinds of criterion cover it without a third pipeline.
- **Tasks as stories with a waived demo.** Overloads "story" so that rule 4 and
  the DoD's human gate gain an "unless" clause each — the kind of exception that
  quietly becomes the rule.

## Consequences — edits this ADR implies
Applied after Alex accepted this ADR (2026-10-07), under the same bootstrap
work item, then reviewed by QA as a diff.

- [x] **`CLAUDE.md` rule 1** — "No code without an approved story … no Ready
      story" → no change without an approved work item (Ready story or Ready
      task).
- [x] **`CLAUDE.md` rule 7** — "Only Alex marks a story Done. Agents may move
      stories to Review" → work item, both sentences.
- [x] **`CLAUDE.md` rule 9** — the pipeline `po → (architect) → dev → qa →
      Alex's demo` is story-only; add the task pipeline `po → owning role → qa →
      Alex confirms and merges`, so a task is not read as skipping two gates.
      *(Not in the original edit list; needed for consistency.)*
- [x] **`CLAUDE.md` rule 10** — "When QA returns READY FOR ALEX, read
      `method/closeout.md`" → say which part applies to a task (no demo script,
      no log; merge command and bookkeeping only).
- [x] **`CLAUDE.md` `## Git workflow`** — add `task/T<n>-<slug>` to the
      supporting-branches list; "Commit messages start with the story ID" → work
      item ID; "`git diff develop...HEAD` is exactly the set of changes a story is
      permitted" → work item; state that nothing reaches `develop` but a merged
      `story/` or `task/` PR.
- [x] **`.claude/agents/po.md`** — "Your only output is a story appended";
      "One story per invocation"; "A story must be demonstrable on the phone" →
      PO writes stories *or* tasks (task template: Status, Intent, Owner,
      Completion criteria each tagged *diff* or *world-state*, Not in scope),
      and owns the `## Backlog` order. Keep the demonstrability rule, scoped to
      stories.
- [x] **`.claude/agents/qa.md`** — "Verdict per acceptance criterion";
      "`git diff develop...HEAD` is the story's whole permitted footprint" →
      per completion criterion for a task; footprint is the work item's; for a
      task, any hunk under `app/src/` or app dependencies is an automatic FAIL
      (section 1's boundary). A world-state criterion: re-run its recorded
      observation read-only and compare, or, if it cannot run from the repo
      machine, mark it UNVERIFIABLE HERE with the steps for Alex — never PASS on
      the record alone. Report format: `CC1 — PASS/FAIL/UNVERIFIABLE`.
- [x] **`method/definition-of-done.md`** — opening "A story is Done when…": add
      a Task section — completion criteria each with a QA verdict, every
      world-state criterion carrying its dated record, any UNVERIFIABLE one
      witnessed by Alex, no hunk outside them, committed `T<n>: …`, PR merged by
      Alex; no phone, no `main` move, no log file.
- [x] **`method/manager-playbook.md`** — "The loop, per story" and "What to
      literally type": add the task loop; "Git, per story": add the `task/`
      branch. The `gh pr merge --squash` lines are **not** touched here — merge
      style is T2's (Spotted point 5).
- [x] **`method/check-closeout.mjs`** — parse `### T<n>` blocks under
      `## Tasks`: status is one of Ready/Doing/Review/Done, and a Done task has no
      unticked box. No log rule for tasks. "Every PR references a work item" is
      **not** in this edit — it is a candidate of ADR-0015 (T1).
      `.github/workflows/closeout.yml` path filter needs no change (it already
      watches `app/backlog.md`).
- [x] **`method/PORTING.md`** — row for 0014 in the core column, count to
      "8 core, 6 project"; "What a new project copies" → "the `## Spotted`,
      `## Tasks` and story structure of the backlog"; a row in "Method changes by
      story" per task that changes the method — this row, not a log file, is a
      task's record (that table's name may want to become "by work item").
- [x] **`app/backlog.md`** — `## Spotted` header "Triage these yourself" → "The
      session routes each entry to its owning role; the role returns a verdict;
      Alex confirms it."; add `## Tasks`; add T1–T4 from the "Method gap" entry
      to `## Backlog` in the order of its "Plan, in order"; the line under the
      title "A story moves: Backlog → … → Done" → a work item moves.
- [x] **`method/closeout.md`** — a short "Task closeout" note: Beat 1 only (verdict,
      merge command, anything unpushed), no Beat 2. *(Not in the original edit
      list; follows from the rule 10 edit.)*
