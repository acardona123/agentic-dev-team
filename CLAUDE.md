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

## Standing rules — every agent, and the session that dispatches them

1. **No code without an approved story.** If `app/backlog.md` has no Ready story
   for what you're about to do, stop and say so.
2. **One story at a time.** Never implement ahead. Scope creep is the failure
   mode we are specifically training against.
3. **The gate is not optional.** `npm run typecheck && npm test && npm run lint`
   must pass before you report work as finished. Report failures honestly; a
   red gate reported as green is the worst possible outcome here.
4. **Thin vertical slices.** Every story ends with something visible on the
   phone. No "build the data layer" work.
5. **Decisions get written down.** Anything a future session would have to
   re-derive goes in `method/adr/` as a numbered ADR.
6. **Be economical with context.** Read the files you need by path; don't crawl
   the repo. Don't restate what's already in `CLAUDE.md` or an ADR — cite it.
   See `method/token-budget.md`.
7. **Only Alex marks a story Done.** Agents may move stories to Review, never to Done.
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
   [ADR-0004](method/adr/0004-git-flow-branching.md)). Never propose skipping,
   reordering or merging a gate. When you propose a next step, name which gate
   it is and whose it is. Alex's attention is the scarce resource and it is
   spent last, on a diff QA has already judged.

## Tech (see method/adr/ for reasoning)

- Expo (React Native) + TypeScript, app lives in `app/`
- Runs on Android via Expo Go, served from WSL2 with `npx expo start --tunnel`
- Geocoding: OpenStreetMap Nominatim, no API key
- Keep the dependency list short and justify every addition in the story

## Repo layout

```
CLAUDE.md          # this file — rules, read by every agent
.claude/agents/    # the team: po, architect, dev, qa
method/            # the reusable method: playbook, DoD, ADRs, per-story log
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

- `story/S<n>-<slug>` — cut from `develop`, PR targets `develop`. One story, one branch.
- `hotfix/<slug>` — cut from `main`, merged to **both** `main` and `develop`. Unused until there's a released build.
- `release/vX.Y` — cut from `develop` when a store build is prepared. Unused for now.

Rules:

- Commit messages start with the story ID: `S2: stream position updates`
- **Agents never push to `main` or `develop`, and never merge a PR.** An agent
  pushes its own `story/` branch and opens the PR. Merging is Alex's.
- CI runs the machine gate on every PR touching `app/`. A red check means the
  story is not finished, whatever any agent reports.
- `main` is only ever fast-forwarded from `develop` after a phone demo.

`git diff develop...HEAD` is exactly the set of changes a story is permitted to
contain. Anything in there not traceable to an acceptance criterion is scope
creep, and QA is expected to name it.

## Code style

- TypeScript strict. No `any` without a comment saying why.
- Business logic (distance maths, alarm trigger rules) goes in pure functions in
  `app/src/lib/`, unit tested, with **no** React or Expo imports. UI stays dumb.
- Comments explain *why*, never *what*.
