# Learning to run an AI dev team

Two things live here:

- **`method/`** — a way of managing AI agents as a small dev team, aimed at
  someone who wants the AI to do the coding and wants to get good at directing it.
- **`app/`** — *Almost There*, the example app it's being developed against: a
  phone app that alarms when you get near an address you chose. For when you're
  on a bus in a city you don't know and won't recognise your stop.

The app is the vehicle. The method is the point.

## The method in one screen

Five principles, and some scaffolding that forces them:

1. **Spec before code.** A story without testable acceptance criteria isn't
   ready to hand to an AI. Writing them is the manager's real job.
2. **Thin vertical slices.** Every story ends with something runnable on the phone.
3. **The reviewer is not the author.** A fresh agent reads the story and the
   diff cold. It is [read-only by design](.claude/agents/qa.md) — a reviewer
   that *can* fix things stops reviewing and starts patching.
4. **A machine gate runs before human attention is spent.** CI, not a
   self-report from the agent that wrote the code.
5. **Decisions get written down.** Sessions forget; the repo doesn't.

Deliberately absent: standups, retros, story points. Ceremony that exists to
sync humans across time.

## The loop

```
1. Human    one sentence of intent
2. po       drafts story + acceptance criteria
3. Human    approve or sharpen the AC                       ← GATE
4. architect  (only when a new tech decision is needed)
5. dev      implements exactly that story, on its own branch
6. qa       reviews cold, read-only, PASS/FAIL per criterion
7. Human    runs it on a real phone → merge, or back to 5   ← GATE
```

Steps 3 and 7 are the job. The rest is delegation.

## Where things are

| Path | What |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Standing rules, loaded by every agent |
| [.claude/agents/](.claude/agents/) | The team: `po`, `architect`, `dev`, `qa` |
| [method/manager-playbook.md](method/manager-playbook.md) | What to actually type, and how to spot yourself managing badly |
| [method/definition-of-done.md](method/definition-of-done.md) | Machine gate → review gate → human gate |
| [method/token-budget.md](method/token-budget.md) | Where the money actually goes, and what not to economise on |
| [method/adr/](method/adr/) | Why the choices were made, and what they cost |
| [method/log/](method/log/) | Per-story notes: what was asked, what came back, what changed in the method |
| [app/backlog.md](app/backlog.md) | The app's stories |

## Status

Method scaffolding built. App not started — S0 (a blank screen on a real phone)
is the next story, deliberately proving the riskiest link before any feature
exists.
