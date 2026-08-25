# Porting this method to another project

The app is a pretext. The method is the product, and one day it has to leave
this repo without the app coming with it.

**This file is kept live, not written at the end.** The expensive part of an
extraction is never moving files — it is working out, months later, which
sentence in which file was about the method and which was about geocoding. Every
story adds a little of that debt unless it is recorded as it happens. So: when a
story changes the method, its entry lands here in the same breath.

---

## The tags

Two places carry the split, and between them they are the inventory:

- **Every ADR** has a `**Scope:**` line under its status — `core` (transfers) or
  `project` (about this app, this stack, this machine). A core decision that
  nevertheless *binds* to something app-specific says what it binds to.
- **Every `method/log/S<n>.md`** tags its `Method change:` entries `core` or
  `project`, so the per-story logs double as the method's changelog.

Kept live by three places, so no one has to remember: `CLAUDE.md` rule 5 (tag
the ADR), `.claude/agents/architect.md` (tag it, and add the row when it is
`core`), and [closeout.md](closeout.md) beat 2 (the story's row, at the point
the story closes).

Current state, ADRs: **7 core, 5 project.**

| Core — transfers | Project — does not |
|---|---|
| [0002](adr/0002-single-repo-two-subtrees.md) two subtrees | [0001](adr/0001-expo-react-native.md) Expo + TypeScript |
| [0003](adr/0003-branch-per-story-with-ci.md) branch/PR/CI per story | [0006](adr/0006-test-and-lint-toolchain.md) test + lint toolchain |
| [0004](adr/0004-git-flow-branching.md) git-flow, two gates | [0007](adr/0007-expo-sdk-pinned-to-expo-go.md) SDK pinned to Expo Go |
| [0005](adr/0005-token-budget.md) token budget | [0008](adr/0008-repo-lives-on-wsl-ext4.md) repo on WSL ext4 |
| [0010](adr/0010-no-orchestrator-agent.md) no orchestrator agent | [0009](adr/0009-geocoding-via-nominatim.md) Nominatim geocoding |
| [0011](adr/0011-one-gate-command-and-pipefail.md) one gate command + pipefail | |
| [0012](adr/0012-ci-check-for-story-closeout-artifacts.md) closeout check | |

## What a new project copies

`CLAUDE.md` rules 1–10 · `.claude/agents/` · `method/` minus the project ADRs
and the per-story logs · `.github/workflows/` · the `## Spotted` and story
structure of the backlog.

## What it must substitute

The method binds to a small number of app facts. They are the whole substitution
list, and keeping it short is the point of this file.

| Binding | Here | Where it is named |
|---|---|---|
| What "demo" means | Alex holds an Android phone running Expo Go | DoD human gate, `closeout.md` |
| The gate command | `npm run gate`, run from `app/` | `CLAUDE.md` rule 3, [ADR-0011](adr/0011-one-gate-command-and-pipefail.md) |
| Where the backlog lives | `app/backlog.md` | `check-closeout.mjs`, agent role files |
| Where logs live | `method/log/S<n>.md` | `check-closeout.mjs`, `log/README.md` |
| The tech section | `CLAUDE.md` `## Tech` | replace wholesale |

If that table grows past a screen, the method has started depending on the app
and something has gone wrong.

## What breaks if you drop a piece

- **No CI** — the machine gate becomes a self-report from the party with an
  incentive to pass ([ADR-0003](adr/0003-branch-per-story-with-ci.md)).
- **No `qa`** — the author reviews their own work. S1's AC3 defect passed
  typecheck, 21 tests and a green badge; only a cold reader caught it.
- **No ADRs** — every session re-derives decisions, and rules that were settled
  get relitigated by whoever loads least context.
- **No per-story log** — the method stops improving, because nothing records
  what it got wrong.
- **No closeout** ([closeout.md](closeout.md)) — the human gate goes back to
  being self-attested, which is how S0 shipped without its log.

## Considered and rejected

**A checker that greps `core` files for app-specific words** (`Expo`, `phone`,
`Nominatim`) to catch leakage. Rejected: a generic file legitimately uses
concrete examples, and a check that cannot tell an illustration from a
dependency fires on correct states — which
[ADR-0012](adr/0012-ci-check-for-story-closeout-artifacts.md) argues is worse
than no check, since it teaches everyone to ignore it. The tags above are
maintained by judgement, deliberately.

---

## Method changes by story

| Story | Change | Scope |
|---|---|---|
| S0 | `dev.md` rule 5 narrowed — dev moves its own story as far as Review, never Done | core |
| S1 | `CLAUDE.md` rules 8–10, the dispatching-session block, [ADR-0010](adr/0010-no-orchestrator-agent.md), DoD human gate reordered, merge clause given an honest exception | core |
| S1 | [ADR-0011](adr/0011-one-gate-command-and-pipefail.md) one gate command + `pipefail`; [ADR-0012](adr/0012-ci-check-for-story-closeout-artifacts.md) + `check-closeout.mjs`; [closeout.md](closeout.md); the `Scope:` tags and this file | core |
| S1 | `po.md`: an AC checkable only on the device must be paired with one checkable at the desk (from S0's log, unimplemented until now); `architect.md`: `Scope:` in the ADR template, and this table kept live | core |

Append a row per story. If three stories running add nothing, either the method
is finished or nobody is looking hard enough — `log/README.md` makes the same
point about the fifth line.
