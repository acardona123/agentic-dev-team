# Almost There — project rules

A phone app that alarms when you get close to an address you chose.
Use case: you're on a bus in an unfamiliar city and don't recognise your stop.

## Who works here

This repo is run as a small dev team of agents. The human (Alex) is the manager.
Roles live in `.claude/agents/`. Read your own role file before acting.

**Alex is a manager, not a coder here.** He comes from C/C++ and is learning to
*direct* AI development, not to learn React. Do not hand him code to write.
Do explain decisions in terms a systems programmer recognises.

### The session Alex is typing at

The specialists in `.claude/agents/` are subagents: they are spawned, they run,
they return a report. None of them can hold a conversation with Alex, which is
why the session that dispatches them is not one of them and has no role file.
It is governed by this document instead. Its job:

- **Dispatch, don't implement.** Route work to `po`, `architect`, `dev`, `qa`.
  Never write app code itself — the reviewer must not be the author, and a
  session that implements its own story has quietly removed that separation.
- **Hold the pipeline** (rule 9). It is the only participant that sees the
  whole loop, so it is the only one positioned to reorder it by accident.
- **Never stand in for a gate.** It may report that a gate passed or failed.
  It may never *be* the gate — not QA's verdict, and never Alex's demo.
- **Read before recommending.** It is the participant most likely to propose a
  next step from memory rather than from `method/`. Rule 8 applies to it most.
- **Clerk for the PO.** The PO has no Bash. Before dispatching it, the session
  cuts the item's branch from `develop`, then commits the PO's draft
  (`S<n>: story — …` / `T<n>: task — …`), Alex's approval (`<ID>: approved
  Ready`) and any planning edit (`<ID>: backlog — …`). Committing someone
  else's text is clerical: the text stays the PO's, the approval Alex's
  ([ADR-0014 §6](method/adr/0014-work-item-types.md#6-only-a-merged-pr-reaches-develop)).

## Standing rules — every agent, and the session that dispatches them

1. **No change without an approved work item.** If `app/backlog.md` *on the
   work item's own branch* has no Ready story or Ready task for what you're
   about to do, stop and say so — the PO's draft of that item, always the
   branch's first commit, and planning edits (`<ID>: backlog — …`) are the only
   writes that come before it. `develop`'s `## Ready` stays empty: an item is drafted
   and approved on its own branch
   ([ADR-0014 §6](method/adr/0014-work-item-types.md#6-only-a-merged-pr-reaches-develop)). A story is
   app behaviour ending in a phone demo; a task is everything else
   ([ADR-0014](method/adr/0014-work-item-types.md)).
2. **One story at a time.** Never implement ahead. Scope creep is the failure
   mode we are specifically training against.
3. **The gate is not optional.** From `app/`, `npm run gate` must pass before you
   report work as finished. Report failures honestly; a red gate reported as
   green is the worst possible outcome here — and it happens by pipe, not by
   lying, so if you trim the output you must keep the status:

       set -o pipefail; cd app && npm run gate 2>&1 | tail -30; echo "GATE EXIT: $?"

   Without `pipefail` that number is the filter's, not the gate's
   ([ADR-0011](method/adr/0011-one-gate-command-and-pipefail.md)).
4. **Thin vertical slices.** Every story ends with something visible on the
   phone. No "build the data layer" work.
5. **Decisions get written down.** Anything a future session would have to
   re-derive goes in `method/adr/` as a numbered ADR, tagged `**Scope:** core`
   or `project` — the method is meant to leave this repo one day without the
   app ([PORTING.md](method/PORTING.md)).
6. **Be economical with context.** Read the files you need by path; don't crawl
   the repo. Don't restate what's already in `CLAUDE.md` or an ADR — cite it.
   See `method/token-budget.md`.
7. **Only Alex marks a work item Done.** Agents may move work items to Review, never to Done.
8. **An undocumented decision is not a decision.** Before you rely on *any*
   inherited decision — a technology choice, a branching model, a step in the
   process — check that `method/adr/` actually justifies it. A choice asserted
   in this file with no ADR behind it is an *open question wearing the costume
   of a rule* — stop and say so rather than building on it. This cuts both
   ways: proposing a deviation from a decision without first reading the ADR
   that made it is the same error run backwards. Rule 5 covers decisions you
   make; this one covers decisions you inherit.
9. **The pipeline is not reorderable.** `po → (architect) → dev → qa → Alex's
   demo`, with the machine gate before QA and QA before Alex
   ([definition-of-done.md](method/definition-of-done.md),
   [manager-playbook.md](method/manager-playbook.md),
   [ADR-0004](method/adr/0004-git-flow-branching.md)). A task has its own
   pipeline, `po → owning role → qa → Alex confirms and merges` — no `dev` and
   no demo because it changes nothing the phone runs, not because a gate was
   skipped ([ADR-0014](method/adr/0014-work-item-types.md)). Never propose skipping,
   reordering or merging a gate. When you propose a next step, name which gate
   it is and whose it is. Alex's attention is the scarce resource and it is
   spent last, on a diff QA has already judged.
10. **Closing a story is guided, not remembered.** When QA returns READY FOR
    ALEX, read `method/closeout.md` and follow it. Alex should never have to
    recall an item of the Human gate unprompted; it arrives already drafted or
    already done, for him to confirm or reject. For a task, only its "Task
    closeout" part applies: the verdict, the merge command and the bookkeeping —
    no demo script, no log.

## Tech (see method/adr/ for reasoning)

- Expo (React Native) + TypeScript, app lives in `app/`
- Runs on Android via Expo Go, served from WSL2 with `npx expo start --tunnel`
- Geocoding: OpenStreetMap Nominatim, no API key
- Keep the dependency list short and justify every addition in the story

## Repo layout

```
CLAUDE.md          # this file — rules, read by every agent
.claude/agents/    # the team: po, architect, dev, qa
method/            # the reusable method: playbook, DoD, closeout, ADRs, per-story log
app/               # the Expo app + its backlog
```

`CLAUDE.md` and `.claude/agents/` are not documentation *about* the method —
they are its executable form, which is why they sit at the root.

## Git workflow

The two long-lived branches carry the project's two gates. Do not blur them:

| Branch | Means | Who moves it |
|---|---|---|
| `main` | **Alex saw it work on a real phone.** | Alex only |
| `develop` | **The machine believes it works** — CI green, QA passed. | merged PR |

Supporting branches:

- `story/S<n>-<slug>` — cut from `develop` when the story is drafted, PR targets
  `develop`. Its first commit is always the PO's draft, then Alex's `approved Ready`,
  then the work
  ([ADR-0014 §6](method/adr/0014-work-item-types.md#6-only-a-merged-pr-reaches-develop)).
  One story, one work branch, plus `story/S<n>-closeout` after the demo for its bookkeeping
  ([ADR-0014 §2](method/adr/0014-work-item-types.md#2-closing-a-story)).
- `task/T<n>-<slug>` — cut from `develop` when the task is drafted, PR targets
  `develop`; same first two commits. One task, one branch.
  A task reaches `main` only by riding the next demoed fast-forward
  ([ADR-0014](method/adr/0014-work-item-types.md)).
- `hotfix/<slug>` — cut from `main`, merged to **both** `main` and `develop`. Unused until there's a released build.
- `release/vX.Y` — cut from `develop` when a store build is prepared. Unused for now.

Rules:

- Commit messages start with the work item ID: `S2: stream position updates`,
  `T1: ADR on where each rule lives`
- **Nothing reaches `develop` except through a merged `story/` or `task/` PR.**
  No direct commits, method edits and backlog edits included.
- A planning edit that belongs to no item — a new `## Backlog` line, a reorder,
  a `## Spotted` entry, whoever writes it — rides the branch in flight as its own
  `<ID>: backlog — …` commit, confined to those two sections, never inside a
  work commit. With nothing in flight it waits for the next item's branch and
  is committed right after the PO's draft; if it cannot wait, it is a task.
- **Agents never push to `main` or `develop`, and never merge a PR.** An agent
  pushes its own `story/` or `task/` branch and opens the PR. Merging is Alex's.
- CI runs the machine gate on every PR touching `app/`. A red check means the
  story is not finished, whatever any agent reports.
- `main` is only ever fast-forwarded after a phone demo, and only to the exact
  demoed commit, never past it. A story's closeout PR lands on `develop` after
  that and rides the next demoed fast-forward.

`git diff develop...HEAD` is exactly the set of changes a work item is permitted
to contain. Anything in there not traceable to an acceptance criterion (story) or
completion criterion (task), other than a confined `backlog —` planning commit,
is scope creep, and QA is expected to name it.

## Code style

- TypeScript strict. No `any` without a comment saying why.
- Business logic (distance maths, alarm trigger rules) goes in pure functions in
  `app/src/lib/`, unit tested, with **no** React or Expo imports. UI stays dumb.
- **A device capability is a parameter, never something reached for.** Anything
  the phone provides — the network, location, sensors, the clock — is passed into
  the logic that uses it, so a test can pass a double instead. S1 did this with
  `fetch` (`FetchLike` in `app/src/lib/geocode.ts`); the same shape is what will
  make a fake-position harness cheap instead of a rewrite. The cost of ignoring
  this is never paid in the story that ignores it.
- Comments explain *why*, never *what*.
