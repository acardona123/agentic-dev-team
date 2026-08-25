# 0004 — git-flow, with the two long-lived branches carrying the two gates
**Status:** Accepted · **Date:** 2026-08-24 · **Supersedes part of** [0003](0003-branch-per-story-with-ci.md)  
**Scope:** core

## Context
ADR-0003 established one branch and one PR per story against `main`. Alex uses a
full git-flow model (main / develop / feature / hotfix / release) in his other
work and wants it here, both as practice and because he disagrees that it's
overhead for solo work.

## Decision
Adopt git-flow, and give the two long-lived branches the project's two existing
gates as their meaning:

- `main` — **Alex saw it work on a real phone.** Fast-forwarded from `develop`
  only after a demo.
- `develop` — **the machine believes it works.** CI green, QA passed the diff.
- `story/S<n>-<slug>` — from `develop`, PR to `develop`.
- `hotfix/<slug>` — from `main`, merged to both. Defined, unused until a release exists.
- `release/vX.Y` — from `develop` when a store build is cut. Defined, unused.

## Reasoning
The standard objection is that `develop` duplicates `main` until you ship a
versioned artifact you can't patch on demand. That objection holds — until the
branches are given distinct meanings, which is what this decision does. "CI says
it works" and "a human watched it work" are genuinely different claims, and the
method depends on never confusing them. Encoding that in git makes `main` at all
times the exact commit Alex has personally demoed.

The second reason is specific to AI teams: agents produce branches far faster
than a human can demo them. As soon as two dev agents run on independent stories
in parallel, their output needs somewhere to integrate and be tested together
before the demo. That is `develop`'s original purpose, and AI work needs it
*more* than human work, not less.

## Trade-off
Two extra merges per story, and a standing risk that `main` drifts far behind
`develop` if Alex batches demos — at which point "main is demoed" quietly stops
being true and the whole scheme becomes decoration. The signal to watch: more
than two undemoed stories sitting on `develop`.

`hotfix/` and `release/` are documented but unexercised, which is a mild
smell — they're kept because the Play Store release that justifies them is a
known future state, not a hypothetical.

## Alternatives rejected
- **Trunk-based (ADR-0003 as written)** — simpler, and correct until the demo gate needed its own home in git. Revisit if `develop` ever stops meaning something different from `main`.
