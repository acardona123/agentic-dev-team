# 0018 — The backlog is a directory: an ordered index, one file per live item, an archive
**Status:** Accepted · **Date:** 2026-11-05 · **Supersedes part of** [0014](0014-work-item-types.md) (§1's Backlog row, status list and world-state record location; §3's Done edit; §5's "unrefined entries"; §6's approval commit) and [0012](0012-ci-check-for-story-closeout-artifacts.md) (the file it parses; its rule 3, Status ↔ section)  
**Scope:** core — binds to `app/backlog/` as the backlog's place and to
`method/log/S<n>.md` as the story log ([PORTING.md](../PORTING.md)
substitution table).

## Context
[ADR-0014](0014-work-item-types.md) decided the backlog lives in the repo
rather than in GitHub Issues. That the repo form is **one file**,
`app/backlog.md`, was never decided: no ADR compared it with another in-repo
form. Observed, on that file:

- **It only grows, and every reader pays for all of it.** 671 lines at
  `5cec249^` (`git show 5cec249^:app/backlog.md | wc -l`), 678 at the T8
  approval. Of those, 217 are the five Done items (S0 29, S1 52, S7 50, T1 32,
  T7 54 lines) and much of the 297-line `## Spotted` is closed entries. Every
  dispatch that needs one item — dev, QA, the architect — reads the whole file
  or locates the item by hand.
- **Status had nowhere to be `Draft`.** ADR-0014 §6 makes Alex's approval the
  Status → Ready commit, so the PO's draft needs an earlier status; none exists,
  and `check-closeout.mjs` exits 1 on every draft commit (T1's, `## Spotted`
  "No status for a drafted…"). This is ADR-0012's revisit trigger, "it fires
  on a state we conclude is legitimate".
- **An approval commit can be empty.** In T7 the PO set `Ready` inside both
  amendments (f8814e6, 80e582e), leaving Alex's `T7: approved Ready` commits
  empty (41078bb, acae7a1) (`## Spotted` "Re-approval after an amendment…").
- **Nothing said when an item leaves `## Backlog`, or where Done tasks go.**
  T1 and T7 are Done and still sit in `## Tasks`; stories move to `## Done`.
- **The check misreads the file's shape.** A `### T<n>` block outside
  `## Tasks` is ignored (exit 0 with an unticked box under Done), and one
  under a story section has its Status and boxes counted against the preceding
  story (`## Spotted` "QA findings left out…", item 1). It has no tests (same
  entry, item 3).

## Decision

### 1. Storage shape: a directory
Three shapes were compared on the six criteria T8 names, token cost split into two rows; "live" means every item not Done, the order, and
the open Spotted entries.

| Criterion | (i) one file, live + archive sections | (ii) live file + archive file | (iii) index + one file per item |
|---|---|---|---|
| Tokens to read the item in progress | whole live part (~375 lines, T8's measurement) or a heading search | same | its own file (T8: 44 lines) |
| Tokens to read all live work | live part, cut at a heading by `awk`; a role without Bash (the PO) cuts only by line numbers it first greps | whole live file | whole top-level files |
| Completeness by construction | only if the archive heading stays last; a misplaced block is read or missed silently | yes, whole file | yes, whole files; a misplaced file is a check failure (§6) |
| Merge conflicts between branches | every edit in one file | every live edit in one file | item bodies apart; the order list is still one file |
| Per-item git history | mixed with every other item's | mixed | `git log -- app/backlog/<ID>.md app/backlog/archive/<ID>.md` |
| CI checkability | heading parse; mis-attribution possible (today's bug) | same, over two files | one item per file: an item's boxes cannot be counted against another; place is a path |
| Porting | one path | two paths | one directory |

**Chosen: (iii).** The deciding rows are the first and the sixth. Most
dispatches need one item, and under (iii) that is one file whose name is the
branch's ID. The check's observed bug, an item's lines counted against another,
cannot happen when the item is the file. Per-item history also makes QA's
"criteria edited after `approved Ready`" check a one-file diff. One record per
file is already this repo's pattern for ADRs and logs, and it is the layout of
Backlog.md, an agent-oriented backlog tool ("every task is a plain `.md` file
in your repo", project README, checked 2026-11-05). On merge conflicts there
is no evidence to separate the shapes: of the 9 planning commits so far, all
rode the single branch in flight (`git log --all --oneline | grep "backlog —"`),
and no log or item records a conflict, because one item is in flight at a time
(rule 2). (iii)
keeps the order in one file, so it gains nothing there and loses nothing.

The layout:

```
app/backlog/
  README.md           entry point: lifecycle, the read recipes, ## Backlog (the order)
  spotted.md          ## Spotted: open entries only
  <ID>.md             one per item not Done (S2.md, T8.md), Status Draft/Ready/Doing/Review
  archive/<ID>.md     one per Done item, stories and tasks alike
  archive/spotted.md  closed Spotted entries, verdicts intact
```

An item's file holds exactly its block, `### <ID> — title` first, in the
templates of `po.md`. The headings `## Backlog` and `## Spotted` keep their
names, so the rule "a planning edit is confined to `## Backlog` and
`## Spotted`" ([ADR-0014 §6](0014-work-item-types.md#6-only-a-merged-pr-reaches-develop))
holds unchanged, now over `README.md` and `spotted.md`. A world-state record
(ADR-0014 §1) is written under its criterion in the task's own file.

**Spotted entries, as each shape would hold them:** (i) open and closed
sections of the one file; (ii) open in the live file, closed in the archive
file; (iii), chosen, open in `spotted.md` and closed in `archive/spotted.md`.
One file per entry was not taken: entries are short, mostly read together, and
have no Status for a check to read.

### 2. Status, and `Draft`
A work item's `**Status:**` line, story or task, is one of `Draft`, `Ready`,
`Doing`, `Review`, `Done`, and it is the only place the state is written.
There are no `## Ready` / `## Doing` / `## Review` / `## Done` / `## Tasks`
headings any more. **`Draft`** is held from the PO's draft commit
(`<ID>: story — …` / `<ID>: task — …`) until Alex's `<ID>: approved Ready`.
`develop` never shows an item `Draft` or `Ready`: they exist only on the
item's own branch, as ADR-0014 §6 already says of Ready.

### 3. Re-approval (Alex's decision, 2026-11-05)
An amendment to an approved item, story or task, sets its Status back to
`Draft`, in the PO's amendment commit. The amendment commit needs no approval
from Alex. **Only Alex's approval commit, `<ID>: approved Ready`, moves an item
to `Ready`**, first approval and re-approval alike, so no approval commit is
ever empty and the last `approved Ready` commit is always the freeze point QA
diffs against.

### 4. The `## Backlog` entry stays until Done
`## Backlog` in `README.md` is the order of every item not Done, top is next:
items not yet drafted and items Draft through Review alike. An item's one-line
entry stays while it is Draft, Ready, Doing or Review, and the PO keeps it
current. It is removed only when the item is Done: a task's in its Done commit
(the branch's last, ADR-0014 §3), a story's in its closeout commit (ADR-0014
§2). The Done commit also moves the item's file into `archive/` (`git mv`, so
history follows by rename) besides what ADR-0014 §3 lists; the story closeout
commit does the same besides what §2 lists.

### 5. Open, closed, and the two read recipes
**Closed is decided before anything is measured.** A Spotted entry is closed
only when its verdict is fully carried out; a "no action" verdict is carried
out when Alex confirms it. A partly carried-out entry stays open, or is split,
with the open part kept verbatim in `spotted.md`. A work item is closed when
Done. A closed entry moves to `archive/spotted.md` in the Done commit of the
task, or the closeout commit of the story, that carried out its verdict's last
part (for a "no action" verdict: of the item in flight when Alex confirmed it).
A move is never a planning commit, and **moved text is byte-identical** to its
source: rewording, if needed, is a separate earlier commit. The one exception
is an item's own Done edit (Status, ticks, witness note), which rides its
`git mv` and shows in `git show -M` as a rename with that diff.

**Live recipe**, for the session and the PO, complete by construction because
it reads whole files and the archive is a subdirectory the glob does not enter:

    cat app/backlog/*.md

With the Read tool: Glob `app/backlog/*.md`, then Read every file it returns,
whole. **The item in progress** is `app/backlog/<ID>.md`, its ID taken from the
branch name; dev and QA read that file, not the recipe.

**Archive recipe**, for anything that cites a Done item or a closed entry:

    cat app/backlog/archive/*.md

A citation reaches its target by ID, as the path `app/backlog/archive/<ID>.md`,
or by an entry's title, found with `grep -n "<title>" app/backlog/archive/spotted.md`.

Neither recipe takes a line limit; both are prose, enforced by nothing but QA
re-running them.

### 6. The closeout check enforces the place
`method/check-closeout.mjs` reads `app/backlog/` and the logs, and fails,
naming the item or file, when:

- `app/backlog/README.md` is missing, has no `## Backlog` heading, or the old
  `app/backlog.md` still exists (two sources of truth);
- a `.md` file sits anywhere but the places in §1;
- an item file's ID heading names another ID than its file name, or the file
  holds a second item heading (mis-attribution, the observed bug);
- an item has no `**Status:**` line, or a Status outside §2's set;
- a top-level item is `Done`, or an archived one is anything but `Done`;
- one ID sits both top-level and in `archive/`;
- a top-level item has no `## Backlog` entry, an archived one still has one,
  or an ID has two entries (an entry is a top-level bullet opening `- **<ID>`;
  an entry for an ID with no file is an item not yet drafted, and passes);
- an archived item has an unticked box; an archived story has no
  `method/log/S<n>.md`, or one with no `**Method change:**` line —
  [ADR-0012](0012-ci-check-for-story-closeout-artifacts.md)'s rules 1, 2 and 4,
  unchanged in substance, now read from `archive/`.

ADR-0012's rule 3 (Status names the section) becomes "Status names the place".

**ADR-0012's trigger, and why the response is not the one it names.** It fired
on `Draft`, a state we conclude is legitimate, and says "delete that rule". The
rule that fired was "a task's Status is in the accepted set"; its set was
incomplete, not its premise. Deleting it would drop the guard against a typo'd
or misplaced Status, which is the guard this decision extends. So the accepted
set is widened. The difference matters in principle: ADR-0012's remedy assumes
a rule that fires on a legitimate state is wrong in kind, and here it was
wrong only in its data.

**Its tests run in the `closeout` workflow**, as a step before the check,
because that is the CI job already path-filtered to the files the script reads
and the script itself, and its red X already means "closeout bookkeeping". Not
in `npm run gate`: that is the app's machine gate, run from `app/` by jest, and
mixing a method check in makes its red X ambiguous (ADR-0012, Alternatives;
[ADR-0011](0011-one-gate-command-and-pipefail.md)). The mechanism rests on an
observed failure, per
[ADR-0016](0016-contradictions-flagged-and-where-rules-live.md) §2: T1's
"`check-closeout.mjs` (including its tests) passes" was met vacuously, there
being no tests, and the script's mis-attribution bug went unnoticed until QA
built a case by hand. The workflow's path filter moves from `app/backlog.md` to
`app/backlog/**` and keeps `app/backlog.md`, so a PR that recreates the old
file still triggers the check that fails it.

## Trade-off
**More files, and a one-time migration.** Every item is a file to create and,
at Done, to move; the order lives in a different file from the items it
orders, so an item can exist without an entry. The check catches that pairing
(§6); a stale entry *text* it cannot catch. The migration repoints every reference to
`app/backlog.md` and to the removed headings across `CLAUDE.md`, role files
and `method/`; frozen ADR
bodies keep the old path, so a reader of ADR-0012 or ADR-0014 meets a path that
no longer exists and must follow the header to this ADR.

**The live recipe is prose.** Nothing stops an agent reading less than the
recipe and acting on it. The completeness guarantee is only that the recipe,
if followed, cannot miss a live item.

**The check is coupled to a layout instead of a heading shape.** A new kind of
file in `app/backlog/` fails until the check learns it — deliberately, since a
file the recipes do not name is a file nobody reads, but it is friction.

**Byte-identical moves cost a commit.** An entry that needs a closing line
before it moves needs that line committed first.

## Revisit when
- *Assumes one item in flight keeps planning edits conflict-free.* Revisit if a
  merge conflict on `app/backlog/README.md` or `spotted.md` is hit — seen in a
  PR's merge or a rebase recorded in a log or the item.
- *Assumes most dispatches need only the item in progress.* Revisit if a role
  is found acting on the item file alone where the live recipe would have
  changed its answer — seen in a QA verdict or a log's "What came back".
- *Assumes the live view stays readable whole.* Revisit if the live recipe's
  output is cut or skipped because of its size — seen in a log, or a session
  that reads with a limit.
- The check fails on a layout we conclude is legitimate — seen in a red
  `closeout` check on a PR.
- A stale or missing `## Backlog` entry text misleads a reader — seen in a QA
  verdict or a `## Spotted` entry.
- A Spotted entry moved to the archive is found still partly open — seen in a
  QA verdict on a move, or a later entry citing it.

## Alternatives rejected
- **(i) One file with live and archive sections.** Least migration, but the
  live read needs a heading-cut command the PO, without Bash, cannot run
  without line numbers; completeness depends on the archive heading staying
  last; mis-attribution stays possible.
- **(ii) A live file plus an archive file.** Keeps `app/backlog.md` and nearly
  every reference, and the live recipe is one `cat`. Rejected because every
  single-item read still pays for the whole live file (~375 lines against 44
  for T8), the check's mis-attribution class of bug stays, and per-item history
  stays mixed; its advantage is one-time, its costs recur on every dispatch.
- **One file per Spotted entry.** Entries have no Status for a check to read,
  are short, and are read as a set.
- **Items in a subdirectory (`app/backlog/items/<ID>.md`).** Between items it
  is empty, git drops it, and `cat app/backlog/items/*.md` errors; the
  top-level glob always has `README.md` to match.
- **A numeric cap on the live view.** Met only by misclassifying a partly-open
  entry or condensing text (T8's second amendment); §5's rule makes closed a
  property of the entry, not of a budget.
- **Accepting the old `app/backlog.md` alongside the directory during a
  transition.** Two sources of truth, and code to delete later. The migration
  lands in the same item.
- **A tool such as Backlog.md itself.** A dependency and a CLI to learn for a
  layout we can hold by convention and a ~190-line check; without it we write
  the files by hand, which is what the PO already does.
