# ADR revisit triggers

One line per ADR in [`adr/`](adr/): the condition its own text names for
revisiting it, and whether that condition has been observed. Why the file
exists, why it lives here and what checks it:
[ADR-0017](adr/0017-adr-revisit-trigger-register.md).

- **Read by QA at every verdict** (`.claude/agents/qa.md`), against the item's
  diff and evidence. Its result is the verdict's `triggers fired:` line, which
  [closeout.md](closeout.md) turns into a drafted item for Alex.
- **Written by the architect.** A new ADR adds its line in the same commit. A
  trigger's text changes only when its ADR is superseded; a state changes only
  in the work item that handles the trigger.
- **States:** `not fired` · `fired <date> — <evidence> → <where handled>` ·
  `→ unrouted` when no item handles it yet, which QA reports until one does.
- The ADR's wording is authoritative; a line here is an index, not a restatement.
- CI (`.github/workflows/adr-register.yml`, `node method/check-adr-register.mjs`)
  fails if an ADR has no line, a line points to no ADR, or an ADR has two lines.
- Porting: drop the `project` lines with their ADRs ([PORTING.md](PORTING.md)).

Initial state recorded 2026-10-08 by T7. Of 16 ADRs, 12 state a trigger (11 in
force; 0007 is superseded) and 4 state none.

## Register

- [0001](adr/0001-expo-react-native.md) · project · **Trigger:** a story needs a native module Expo Go doesn't bundle; background geofencing is the expected one. · **State:** not fired.
- [0002](adr/0002-single-repo-two-subtrees.md) · core · **Trigger:** the app gains a user, contributor or release that isn't Alex; CI needs to differ per subtree; or the method is reused on a second project. · **State:** not fired; CI already differs per subtree by path filters (`gate.yml`, `closeout.yml`), which one repo accommodates without cramp.
- [0003](adr/0003-branch-per-story-with-ci.md) · core · **Trigger:** none stated (its trade-off names a risk to watch, a green badge read as leave to skip the diff, not a condition to revisit; partly superseded by 0004). · **State:** —
- [0004](adr/0004-git-flow-branching.md) · core · **Trigger:** more than two undemoed stories sitting on `develop`; or `develop` stops meaning something different from `main`. · **State:** not fired; no undemoed story on `develop`; S7, the last story, was demoed and `develop` since holds only method work.
- [0005](adr/0005-token-budget.md) · core · **Trigger:** none stated (its trade-off names a risk, trimming review to save tokens, not a condition to revisit). · **State:** —
- [0006](adr/0006-test-and-lint-toolchain.md) · project · **Trigger:** none stated (its WSL2 notes are contradicted by Alex's machine fix, `## Spotted` "Dev-loop networking", routed to T3: a contradiction, not a trigger). · **State:** —
- [0007](adr/0007-expo-sdk-pinned-to-expo-go.md) · project · superseded by 0013 · **Trigger:** "revisit at the background location story, per ADR 0001" (development build), inherited by 0001 and 0013. · **State:** stated trigger not fired; its premise, "the Play Store build is capped at 54" (Context, not a trigger), fell 2026-09-30 — [log/S7.md](log/S7.md) "What came back": "the store is capped at 54" was false → handled: superseded by [0013](adr/0013-expo-sdk-follows-the-store-expo-go.md) in S7; 0007 not edited.
- [0008](adr/0008-repo-lives-on-wsl-ext4.md) · project · **Trigger:** none stated. · **State:** —
- [0009](adr/0009-geocoding-via-nominatim.md) · project · **Trigger:** (a) 429s or blocks in normal single-user use; (b) users cannot find their stop because matching is too literal; (c) the app is distributed beyond a handful of people. · **State:** not fired; S7's demo searched successfully ([log/S7.md](log/S7.md)).
- [0010](adr/0010-no-orchestrator-agent.md) · core · **Trigger:** the dispatcher block in `CLAUDE.md` outgrows roughly a screen or accumulates procedure; or a second gate-order or self-implementation slip. · **State:** not fired; block is 23 lines (2026-10-08); the S7 rule-8 slip was judged "not met as worded; met in kind" by [0016 §5](adr/0016-contradictions-flagged-and-where-rules-live.md), which answered it.
- [0011](adr/0011-one-gate-command-and-pipefail.md) · core · **Trigger:** a third `pipefail` slip recorded in a log; escalate to a checked-in `method/gate.sh`. · **State:** fired 2026-09-30 as worded — [log/S7.md](log/S7.md) "Method change": the architect ran an install through `| tail` without `pipefail`, "logged here so it counts toward" this signal; third after S0's log and 0011's own Context (an install, not the gate) → unrouted.
- [0012](adr/0012-ci-check-for-story-closeout-artifacts.md) · core · **Trigger:** the check fires on a state we conclude is legitimate (then delete that rule); or a closeout step is skipped that leaves no artifact (then check refs). · **State:** first fired 2026-10-07 — the check exits 1 on T1's `**Status:** Draft` commit, and Alex's 2026-10-08 triage of `## Spotted` "No status for a drafted…" makes Draft legitimate → T8; second not fired as worded (S7 moved `main` past the demoed commit, a step done wrong rather than skipped, answered by [0014 §2](adr/0014-work-item-types.md#2-closing-a-story)).
- [0013](adr/0013-expo-sdk-follows-the-store-expo-go.md) · project · **Trigger:** an SDK jump lands in the middle of a story, or a story needs an API Expo Go lacks; then a development build. · **State:** not fired.
- [0014](adr/0014-work-item-types.md) · core · **Trigger:** Alex batches unrelated edits into one task; the every-PR CI check does not land, or a task ships executable method code without a test; a session or port reads stale method or status from `main`; a closeout PR carries more than §2's files; a world-state record is found false when relied on; Alex wants to refine ahead, or a second item must be Ready while one is in flight. · **State:** not fired; the every-PR check is queued as T5, not yet landed.
- [0015](adr/0015-adr-lifecycle.md) · core · **Trigger:** someone needs an ADR's history twice and the PR is gone or unreadable; a consolidated ADR is found to state less than Alex accepted; superseding ADRs are written only to fix typos. · **State:** not fired.
- [0016](adr/0016-contradictions-flagged-and-where-rules-live.md) · core · **Trigger:** a third contradiction filed after the fact; branch protection found changed or blocking a legitimate merge; a PR passes (c) with an unrelated diff QA misses; and each §3 "reopen when": (a) an agent commit on local `develop`/`main` once (d) is in force, or (d) cannot be applied; (b) QA recorded writing; (e) a closeout run without reading `closeout.md`; (f) the `CLAUDE.md` length warning, a slip blamed on length, or 0010's screen signal; (g) a second project adopts the method; §4 a diff contradicting an accepted ADR reaches `develop` past QA. · **State:** not fired; (c) and (d) not yet built (T5, T6); `CLAUDE.md` is 177 lines.
- [0017](adr/0017-adr-revisit-trigger-register.md) · core · **Trigger:** an ADR is found wrong by a premise its trigger did not name; a trigger is found to have fired before a verdict that said `none`; the check fires on a state we conclude is legitimate. · **State:** not fired.
