# Almost There — project rules

A phone app that alarms when you get close to an address you chose.
Use case: you're on a bus in an unfamiliar city and don't recognise your stop.

## Who works here

This repo is run as a small dev team of agents. The human (Alex) is the manager.
Roles live in `.claude/agents/`. Read your own role file before acting.

**Alex is a manager, not a coder here.** He comes from C/C++ and is learning to
*direct* AI development, not to learn React. Do not hand him code to write.
Do explain decisions in terms a systems programmer recognises.

## Standing rules — all agents

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
6. **Only Alex marks a story Done.** Agents may move stories to Review, never to Done.

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

One story = one branch = one PR. Non-negotiable parts:

- Branch name: `story/S<n>-<slug>`, cut from up-to-date `main`
- Commit messages start with the story ID: `S2: stream position updates`
- **Agents never push to `main` and never merge a PR.** Merging is Alex's Done gate.
- CI runs the machine gate on every PR touching `app/`. A red check means the
  story is not finished, regardless of what any agent reports.

The scope boundary matters more than it looks: `git diff main...HEAD` is exactly
the set of changes a story is allowed to contain. Anything in there that is not
traceable to an acceptance criterion is scope creep, and QA is expected to
call it out.

## Code style

- TypeScript strict. No `any` without a comment saying why.
- Business logic (distance maths, alarm trigger rules) goes in pure functions in
  `app/src/lib/`, unit tested, with **no** React or Expo imports. UI stays dumb.
- Comments explain *why*, never *what*.
