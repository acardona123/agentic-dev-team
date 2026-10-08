# ADR revisit triggers

One line per ADR file in [`adr/`](adr/), superseded ones included: the
condition its own text names for revisiting it, and its State. Why the file
exists, why it lives here and what checks it:
[ADR-0017](adr/0017-adr-revisit-trigger-register.md).

- **State** is short, overwritten, never appended: `not fired` ·
  `open → <item>` (an ID, or the `## Backlog` line that will become one) ·
  `superseded by 00xx — not evaluated`. No evidence and no history here; they
  live in the item that handles the trigger, and in git.
- **Read by QA at every verdict** (`.claude/agents/qa.md`), against the item's
  diff and evidence; its `triggers fired:` line goes to
  [closeout.md](closeout.md). QA skips `superseded by` lines, and evaluates only
  the in-force parts of an ADR that is partly superseded.
- **Written by the architect.** A new ADR adds its line in the same commit,
  copying its `## Revisit when` section. A State changes only in a work item's
  own diff — the item that handles the trigger. A superseding ADR restates
  every trigger it keeps; nothing is inherited from the old line.
- The ADR's wording is authoritative; a line here is an index, not a restatement.
- CI (`.github/workflows/adr-register.yml`, `node method/check-adr-register.mjs`)
  fails if an ADR has no line, a line points to no ADR, an ADR has two lines,
  or an ADR from 0017 on has no `## Revisit when` section.
- Porting: drop the `project` lines with their ADRs ([PORTING.md](PORTING.md)).

## Register

- [0001](adr/0001-expo-react-native.md) · project · **Trigger:** a story needs a native module Expo Go doesn't bundle; background geofencing is the expected one. · **State:** not fired
- [0002](adr/0002-single-repo-two-subtrees.md) · core · **Trigger:** the app gains a user, contributor or release that isn't Alex; CI needs to differ per subtree; or the method is reused on a second project. · **State:** not fired
- [0003](adr/0003-branch-per-story-with-ci.md) · core · partly superseded by 0004 · **Trigger:** none stated (its trade-off names a risk to watch, a green badge read as leave to skip the diff, not a condition to revisit). · **State:** not fired
- [0004](adr/0004-git-flow-branching.md) · core · **Trigger:** more than two undemoed stories sitting on `develop`; or `develop` stops meaning something different from `main`. · **State:** not fired
- [0005](adr/0005-token-budget.md) · core · **Trigger:** none stated (its trade-off names a risk, trimming review to save tokens, not a condition to revisit). · **State:** not fired
- [0006](adr/0006-test-and-lint-toolchain.md) · project · **Trigger:** none stated. · **State:** not fired
- [0007](adr/0007-expo-sdk-pinned-to-expo-go.md) · project · **Trigger:** "revisit at the background location story, per ADR 0001" (development build). · **State:** superseded by 0013 — not evaluated
- [0008](adr/0008-repo-lives-on-wsl-ext4.md) · project · **Trigger:** none stated. · **State:** not fired
- [0009](adr/0009-geocoding-via-nominatim.md) · project · **Trigger:** (a) 429s or blocks in normal single-user use; (b) users cannot find their stop because matching is too literal; (c) the app is distributed beyond a handful of people. · **State:** not fired
- [0010](adr/0010-no-orchestrator-agent.md) · core · **Trigger:** the dispatcher block in `CLAUDE.md` outgrows roughly a screen or accumulates procedure; or a second gate-order or self-implementation slip. · **State:** not fired
- [0011](adr/0011-one-gate-command-and-pipefail.md) · core · **Trigger:** a third `pipefail` slip recorded in a log; escalate to a checked-in `method/gate.sh`. · **State:** open → `## Backlog` "Revisit ADR-0011"
- [0012](adr/0012-ci-check-for-story-closeout-artifacts.md) · core · **Trigger:** the check fires on a state we conclude is legitimate (then delete that rule); or a closeout step is skipped that leaves no artifact, e.g. `main` never fast-forwarded (then check refs). · **State:** open → T8
- [0013](adr/0013-expo-sdk-follows-the-store-expo-go.md) · project · **Trigger:** an SDK jump lands in the middle of a story, or a story needs an API Expo Go lacks; then a development build. · **State:** not fired
- [0014](adr/0014-work-item-types.md) · core · **Trigger:** Alex batches unrelated edits into one task; the every-PR CI check does not land, or a task ships executable method code without a test; a session or port reads stale method or status from `main`; a closeout PR carries more than §2's files; a world-state record is found false when relied on; Alex wants to refine ahead, or a second item must be Ready while one is in flight; and the three "Reopen" under Alternatives rejected: the lag of `main` behind `develop` costs more than commit identity (file-equivalence check); `main` must point somewhere other than the demoed commit (`demo/S<n>` tag); Alex wants Ready items visible on `develop`, or to refine ahead (spec PR). · **State:** not fired
- [0015](adr/0015-adr-lifecycle.md) · core · **Trigger:** someone needs an ADR's history twice and the PR is gone or unreadable; a consolidated ADR is found to state less than Alex accepted; superseding ADRs are written only to fix typos. · **State:** not fired
- [0016](adr/0016-contradictions-flagged-and-where-rules-live.md) · core · **Trigger:** a third contradiction filed after the fact; branch protection found changed or blocking a legitimate merge; a PR passes (c) with an unrelated diff QA misses; and each §3 "reopen when": (a) an agent commit on local `develop`/`main` once (d) is in force, or (d) cannot be applied; (b) QA recorded writing; (e) a closeout run without reading `closeout.md`; (f) the `CLAUDE.md` length warning, a slip blamed on length, or 0010's screen signal; (g) a second project adopts the method; §4 a diff contradicting an accepted ADR reaches `develop` past QA. · **State:** not fired
- [0017](adr/0017-adr-revisit-trigger-register.md) · core · **Trigger:** a trigger found fired before a verdict that said `none`; an ADR found wrong by a premise its trigger did not name; `adr-register` red on a PR we conclude is right; a trigger reported twice for the same evidence, or a decision resting on a `not fired` the backlog contradicted. · **State:** not fired
