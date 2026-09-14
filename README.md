<h1 align="center">Learning to run an AI dev team</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Claude%20Code-D97757?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude Code"/>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native"/>
  <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions"/>
</p>

<p align="center"><strong>A working method for directing AI agents as a small dev team, and the app it is being tested against.</strong></p>

---

## 📌 Overview

Two things live here.
`method/` is a way of managing AI agents as a small dev team, aimed at someone who wants the AI to do the coding and wants to get good at directing it.
`app/` is *Almost There*, the example app it is being developed against: a phone app that alarms when you get near an address you chose, for when you are on a bus in a city you do not know and will not recognise your stop.
The app is the vehicle, the method is the point.

> **The application code in `app/` is written by AI agents, not by hand.** That is the entire premise of the repository, and it is why GitHub reports this as a TypeScript project. TypeScript is not a skill I claim. What is mine is everything in `method/`, `CLAUDE.md` and `.claude/agents/`: the specifications, the acceptance criteria, the gates, the architecture decisions and the judgement about what to accept.

## ✨ Features

- **Spec before code.** A story without testable acceptance criteria is not ready to hand to an AI, and writing them is the manager's real job.
- **Thin vertical slices.** Every story ends with something runnable on the phone.
- **The reviewer is not the author.** A fresh agent reads the story and the diff cold, [read-only by design](.claude/agents/qa.md), because a reviewer that *can* fix things stops reviewing and starts patching.
- **A machine gate runs before human attention is spent.** CI, not a self-report from the agent that wrote the code.
- **Decisions get written down.** Sessions forget, the repo does not, so every inherited choice lives in a numbered [ADR](method/adr/).

Deliberately absent: standups, retros, story points, the ceremony that exists to sync humans across time.

## 🧭 The loop

```
1. Human      one sentence of intent
2. po         drafts story + acceptance criteria
3. Human      approve or sharpen the AC                       <- GATE
4. architect  (only when a new tech decision is needed)
5. dev        implements exactly that story, on its own branch
6. qa         reviews cold, read-only, PASS/FAIL per criterion
7. Human      runs it on a real phone -> merge, or back to 5   <- GATE
```

Steps 3 and 7 are the job, the rest is delegation.

## 🛠️ Tech Stack

<p>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native"/>
  <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions"/>
  <img src="https://img.shields.io/badge/Claude%20Code-D97757?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude Code"/>
</p>

## 🚀 Getting Started

```bash
git clone https://github.com/acardona123/agentic-dev-team.git
cd agentic-dev-team/app
npm install
```

## 📖 Usage

```bash
npx expo start
```

Scan the QR code with Expo Go on a phone running SDK 54, or press `a` / `i` for an emulator.
The method itself is used by reading [CLAUDE.md](CLAUDE.md) and the role files in [.claude/agents/](.claude/agents/), then dispatching agents through the loop above.

## 🧪 Tests

```bash
cd app
npm run gate
```

That single command chains `typecheck`, `test` and `lint`, the same gate CI runs on every PR against `main` or `develop`.
It has to pass before a story is reported done ([method/definition-of-done.md](method/definition-of-done.md)), and it is the machine half of a two-part review: the gate catches what compiles wrong, a cold QA pass catches what compiles fine but behaves wrong.

## 📁 Structure

| Path | What |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Standing rules, loaded by every agent |
| [.claude/agents/](.claude/agents/) | The team: `po`, `architect`, `dev`, `qa` |
| [method/manager-playbook.md](method/manager-playbook.md) | What to actually type, and how to spot yourself managing badly |
| [method/definition-of-done.md](method/definition-of-done.md) | Machine gate, then review gate, then human gate |
| [method/token-budget.md](method/token-budget.md) | Where the money actually goes, and what not to economise on |
| [method/adr/](method/adr/) | Why the choices were made, and what they cost |
| [method/log/](method/log/) | Per-story notes: what was asked, what came back, what changed in the method |
| [app/backlog.md](app/backlog.md) | The app's stories |

## 📊 Status

Two stories done, both demoed on a real phone and merged.

**S0, walking skeleton.**
A blank screen on the phone, chosen first to prove the riskiest link before any feature existed.
It found two defects that had nothing to do with features: the Expo SDK the scaffold picked was newer than the Expo Go build on the phone, and the repo sat on a Windows-mounted filesystem that delivers no file-change events, so hot reload never fired.
Both would have been blamed on feature code had they first shown up in S1.

**S1, address search.**
Geocoding against OpenStreetMap Nominatim, results listed and one held as the target.
QA failed the first pass and was right to: every outcome was cached, failures included, so a search that failed in a tunnel could never be retried for the rest of the session.
It typechecked, passed 21 tests, and CI was green.
An error path that fails politely is invisible to a machine gate by construction, which is the whole argument for the review gate in one defect.

**S2, live position, is blocked on purpose.**
The product-owner agent was asked to refine it and stopped, because nothing in `method/adr/` decides how the app obtains the phone's position, and writing the criteria would have meant silently deciding it.
The rule that stopped it is [rule 8](CLAUDE.md): a choice asserted with no ADR behind it is an open question wearing the costume of a rule.
The architect writes that ADR first.

The largest changes so far have been to the method, not the app.
Every one came from the same failure: a rule that was true, written down, and sitting in a file nobody had loaded.
The fix each time was location, not wording.
The per-story write-ups are in [method/log/](method/log/).
