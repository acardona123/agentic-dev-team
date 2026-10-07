# 0014 — Two work-item types: story and task
**Status:** Accepted · **Date:** 2026-10-07  
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

Closing every path to `develop` but a merged PR exposes three writes that had
no PR to ride:

- **A story's closeout bookkeeping.** The story Human gate
  ([DoD](../definition-of-done.md)) runs merge → demo → `main` fast-forward, and
  only then are the Done status, ticked AC, `method/log/S<n>.md` and the
  PORTING row known. S7's went straight to `develop` (951d36d), and `main` was
  fast-forwarded to it rather than to the demoed a1d5207. The commit cannot be
  dropped: [ADR-0012](0012-ci-check-for-story-closeout-artifacts.md) fails a
  Done story with no log.
- **A task's Done edit.** The DoD made "PR merged" a Done condition, the
  playbook said "merge the PR → Done", and `closeout.md` committed Done on the
  branch before the merge — three files, three different moments.
- **The PO's backlog writes.** The PO writes `app/backlog.md` before any work
  branch exists: the item's block, Alex's approval to Ready, the `## Backlog`
  order, new one-line entries. Those commits went straight to `develop`
  (0234db3 "S1: approved Ready", 3633e71, two 2026-10-07 `Backlog:` commits);
  S7's story text, by contrast, was the first commit on its own branch (PR #4,
  a1d5207). Two facts constrain the answer: the PO has no Bash (`po.md`
  frontmatter), so someone else cuts branches and commits its writes; and one
  item is in flight at a time (rule 2), so two branches editing
  `app/backlog.md` at once is not a normal state.

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
| Human gate | Merge to `develop`, phone demo on D, `main` fast-forwarded to D, closeout PR merged — in that order (§2, [DoD](../definition-of-done.md)) | Alex reads the deliverable, confirms it, witnesses any world-state criterion QA could not observe; the Done edit is the branch's last commit, and he merges the PR (§3). No demo. |
| Branch | `story/S<n>-<slug>`, cut when the story is drafted (§6), plus `story/S<n>-closeout` after the demo (§2) | `task/T<n>-<slug>`, cut from `develop` when the task is drafted (§6), PR to `develop` |
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

### 2. Closing a story
The order is fixed:

1. Merge the story PR; `develop` is now at D.
2. Demo D on the phone.
3. Fast-forward `main` to D.
4. Merge the closeout PR; `develop` is now at D′.

**A closeout PR carries the bookkeeping.** After the demo passes, the session
cuts `story/S<n>-closeout` from `develop` and commits `S<n>: closeout`,
containing only the bookkeeping that `closeout.md` Beat 2 drafts and Alex
confirms:
- the story's block: Status → Done, AC ticked, PR recorded;
- `method/log/S<n>.md`;
- the story's PORTING row;
- any `## Spotted` / `## Backlog` entries from the demo.

Alex merges it to `develop`. He reviews it, because the log and the Done call
are his (rule 7), and so does the `closeout` CI check, which checks exactly
these artifacts ([ADR-0012](0012-ci-check-for-story-closeout-artifacts.md)).
There is no QA run, because there is no acceptance criterion to judge. The
branch is a `story/` branch, so §6 holds unchanged.

**`main` is always fast-forwarded to D, the exact demoed commit, never to D′.**
The closeout reaches `main` with the next demoed fast-forward — the same lag §1
accepts for tasks. So [ADR-0004](0004-git-flow-branching.md) is not amended,
and §1's "`main` keeps ADR-0004's single meaning" stays literally true: `main`
names the demoed commit by identity, not by a property of its contents.

**The log names the demoed commit.** The `method/log/README.md` template carries
`**Demonstrated commit:** <SHA of D>`. The session fills it in its Beat 2
draft, so Alex never has to remember it. The record of an acceptance lives in a
later commit, separate from the accepted object, because the proof of an action
cannot be part of the state observed before the action.

**Every manual step is guided.** Rule 10 requires the session to give Alex every
manual step this adds, in the order above and at the moment it can run, as
paste-ready commands in `closeout.md` Beat 2: fast-forward `main` to D and push,
then merge the closeout PR. He confirms or rejects; he does not recall.

**Why this shape.** Nothing lands on a protected branch except by PR,
bookkeeping included — common industry practice; the release-PR pattern
(release-please, changesets) is the same move. The accepted commit is pinned by
identity. A file-equivalence check in its place can pass for the wrong reason:
a runtime-affecting file outside `app/`, or build config, would slip through
and give a false guarantee. This shape's worst case is documentation one cycle
late.

### 3. Closing a task
**Done is the last commit on the branch; the merge makes it true.** After QA and
Alex's read, the Done edit is committed on the `task/` branch as its final
commit, and then Alex merges. The edit contains:
- Status → Done and the boxes ticked;
- Alex's witness note under any UNVERIFIABLE criterion;
- the PORTING row.

Done is a claim about `develop`, and the edit reaches `develop` only by that
merge, so `develop` can never show a task as Done while its PR is unmerged. The
DoD's "PR merged" and the playbook's "merge the PR → Done" describe the same
event. Tasks get no closeout PR.

### 4. Spotted triage is routed, not deferred
The dispatching session routes each `## Spotted` entry to the role that owns its
subject (`architect` for technology and config, `po` for product and backlog
shape, `qa` for review findings; an entry that fits no role goes to `po`).
That role returns a **verdict**: no action
(with the reason), becomes a task, or becomes a story candidate. Alex confirms or
rejects the verdict; he does not do the triage. The verdict is written into the
entry, as the 2026-08-25 triages already are. Routing is dispatch, which the
session may do; producing the verdict itself would be the session standing in
for a role, which `CLAUDE.md` forbids it.

### 5. The PO orders the backlog
The PO owns the order of everything not yet in flight — stories and tasks alike
— in addition to writing them. Order is expressed in one place, the
`## Backlog` list, where unrefined stories and tasks sit as one-line entries;
the top entry is next. Refined task blocks live under `## Tasks`.

### 6. Only a merged PR reaches `develop`
**No commit lands on `develop` except through a merged `story/` or `task/`
PR** — method edits, closeout bookkeeping (§2) and backlog writes included. The
`Method:` commits straight on `develop` stop.

**The PO's writes land on the item's own branch, from its first commit.** Before
the PO is dispatched, the session cuts `story/S<n>-<slug>` or
`task/T<n>-<slug>` from `develop`. The PO's draft is always its first commit
(`S<n>: story — …` / `T<n>: task — …`); Alex's approval is the Status → Ready
commit (`<ID>: approved Ready`); the work follows on the same branch, and one PR
carries spec and work. Rule 1's Ready item is therefore read on the item's own
branch, and `develop`'s `## Ready` stays empty.

**Planning edits ride the branch in flight.** A planning edit that belongs to no
item — a new one-line `## Backlog` entry, a reorder, a `## Spotted` entry,
whoever writes it, dev included — is its own commit `<ID>: backlog — …` on the
branch in flight, confined to `## Backlog` and `## Spotted`, never inside a work
commit. With nothing in flight, it waits for the next item's branch and is
committed right after the PO's draft; if it cannot wait, it is a task of its
own. QA checks such a commit for confinement, not traceability, and checks the
item's own block for criteria edited after the last `approved Ready` commit.

**The session is the PO's clerk.** The PO has no Bash, so the session cuts the
branch and commits the PO's writes and Alex's approval. A commit of someone
else's text is clerical, not authorship: the text stays the PO's, the approval
Alex's.

Why this path: it costs no extra PR; QA sees the approved criteria and the work
in one diff, and can see whether the criteria moved after the approval commit;
it is S7's practice, written down, and the spec-driven-development shape — spec
committed first, implementation after approval, same PR — with atomic commits,
one logical change each.

**Bootstrap exception.** The work that wrote this ADR could not be a task,
because the type did not exist yet. It ran under the "Method gap" entry in
`## Spotted` as its work item, on branch `method/work-items`, with a PR to
`develop` — the one exception; the rule above holds from that PR's merge on.
The four follow-ups queued in that entry become T1–T4.

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
the whole review. Accepted for now: T1's ADR is to add a CI check that runs on
every PR. Revisit if that check does not land, or when a task first ships
executable method code (as `check-closeout.mjs` is) without a test.

**`main` lags `develop` by every task since the last demo, and by each story's
closeout.** Method edits are invisible on the default branch until the next
story is demoed, and on `main` the latest story reads Review with no log until
then. Accepted: [ADR-0004](0004-git-flow-branching.md)'s meaning for `main`
wins. Signal: a fresh session or a porting attempt reads stale method or status
from `main`. Then tasks and closeouts get their own promotion rule, which this
ADR deliberately does not invent ahead of need.

**One more PR per story**, plus one more `closeout` CI run. The cost is agent
tokens and one paste; Alex already reads the log draft. Signal to revisit: a
closeout PR carrying anything beyond the files §2 lists — then CI should
enforce the file list.

**The task's Done commit is made after QA**, so QA never sees it. The
`closeout` check (status ↔ section, no unticked box on Done) is its only
machine review.

**A world-state record is a snapshot, not a guarantee.** It proves what was
observed on its date; the machine or the GitHub setting can drift the next day,
and nothing re-checks it. A criterion only Alex can witness rests on his
attention, exactly as a demo does. Signal: a recorded state is found false when
a later item relies on it — then that observation earns a check of its own.

**Triage still costs Alex a confirmation per entry**, and a role-produced verdict
can be wrong in the way its role is blind. Cheaper than him doing the triage,
which is what was not happening.

**"Ready" exists only on the item's branch.** `develop` never shows an item as
Ready or Doing; it goes from a one-line `## Backlog` entry to Review (story) or
Done (task), and rule 1 must be read on the item's branch. A rejected draft dies
with its branch (it survives on the remote only if pushed). No item can be
refined ahead of the one in flight. Signal to revisit: Alex wants to refine
ahead, or a second item needs to be Ready while one is in flight — then the
spec PR below.

**Planning hunks ride a PR whose criteria they do not trace to**, so QA needs a
confinement check for them instead of a traceability one.

**Under squash merging** (the playbook's current `--squash`, which T2 revisits),
the approval commit vanishes into one squashed commit on `develop`; it stays on
the PR.

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
- **`main` → D′, guarded by a `git diff --quiet D develop -- app
  ':!app/backlog.md'` check.** It weakens ADR-0004's commit-identity guarantee
  into a file-equivalence check, which passes wrongly when a runtime-affecting
  file sits outside the pathspec. Reopen if the lag of `main` behind `develop`
  is shown to cost more than that guarantee.
- **Annotated tag `demo/S<n>` on D, plus a CI check that `main` moves only to a
  tagged commit.** It adds a manual step and a mechanism that no observed
  failure justifies, while `main` = D already names the demoed commit. Reopen
  the day `main` must point somewhere other than the demoed commit, or as a
  candidate for T1's ADR.
- **git notes on D.** They are invisible on the host and need an explicit fetch
  and push.
- **release-please / changesets.** That is release tooling for a different
  problem, and an external dependency. Without it we write one commit by hand,
  which is what §2 does.
- **Commit the bookkeeping on the story branch before merging.** The log
  records the demo's outcome, and the demo follows the merge (DoD order).
- **Demo the story branch, then merge with the bookkeeping included.** It
  reorders the Human gate, which the DoD fixed for integration reasons.
- **A named exception letting Alex commit bookkeeping straight to `develop`.**
  It reopens the unreviewed-direct-commit hole §6 closes, and it breaks the
  moment branch protection (a world-state task) lands.
- **Fold the bookkeeping into the next work item's PR.** That is scope creep
  by construction.
- **A new `closeout/` branch prefix.** Every rule that lists two prefixes would
  need a third; `story/S<n>-closeout` says the same with none.
- **Close out tasks by a second PR too.** It doubles a task's ceremony to fix a
  wording disagreement.
- **A spec PR before the work PR.** The session cuts `story/S<n>-spec` (or
  `task/T<n>-spec`); the PO's draft is committed there; Alex's step-3 approval
  *is* merging that PR, with Status: Ready; the work branch is then cut from a
  `develop` that shows the item Ready, and planning edits ride the next spec PR
  — a mirror of the closeout PR. For it: `develop` shows the true state at all
  times, the approval is a recorded merge rather than a chat "yes", refinement
  ahead is possible, and rule 1 needs no change. Against it: three PRs per story
  (spec, work, closeout) and two per task; the spec PR has no QA — no criterion
  to judge it against — so it is Alex's read alone; more paste-ready commands at
  step 3. Reopen when Alex wants Ready items visible on `develop`, or wants to
  refine an item ahead of the one in flight.
- **A named exception: backlog-only commits may go straight to `develop`.**
  Zero ceremony, but it reopens the unreviewed-direct-commit hole §6 closes,
  and fails the day branch protection lands — the same reasons as for closeout
  bookkeeping.
- **A standing "backlog grooming" task**, one long-lived `task/` for all
  planning edits. A task that never reaches Done breaks the Done semantics, and
  it needs a Ready block on `develop` before it can exist — the regress §6
  resolves.
