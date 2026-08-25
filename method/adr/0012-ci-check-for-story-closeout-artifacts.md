# 0012 — A CI check for story-closeout artifacts
**Status:** Accepted · **Date:** 2026-08-25

## Context
S0 was marked Done and fast-forwarded to `main` without `method/log/S0.md` ever
being written. The DoD's human gate required it and `method/log/README.md`
specified its format; both existed at the time. Nobody noticed for a story and a
half.

The cause is structural, not personal. Each gate in
[definition-of-done.md](../definition-of-done.md) has an enforcer except one:
the machine gate has CI, the review gate has `qa`, and the human gate is
self-attested by Alex with no reviewer at all. Most of that gate genuinely
cannot be machine-checked — nothing can verify he held the phone. But part of it
leaves *artifacts in the repo*, and an artifact is exactly what a machine can
check. [ADR-0010](0010-no-orchestrator-agent.md)'s second revisit trigger
already says the answer to a repeated self-enforcement slip is a mechanical
check rather than more prose. This is that, one gate over.

## Decision
`method/check-closeout.mjs` — dependency-free node, ~90 lines, runnable as
`node method/check-closeout.mjs` from anywhere — parses `app/backlog.md` and
enforces three rules. `.github/workflows/closeout.yml` runs it on pull requests
and on pushes to `main`/`develop`, path-filtered to the files it reads.

1. **Every story under `## Done` has `method/log/S<n>.md`.** The observed
   failure.
2. **Every story under `## Done` has all its checkboxes ticked.** "Done
   except..." means Doing, in the DoD's own words.
3. **A story's `**Status:**` line names the section it sits in.** Checked for
   `Ready`/`Doing`/`Review`/`Done` alike, since it is the same parse and a
   disagreement in either direction is a half-finished edit.

**And a fourth, narrower one:** the log file must contain the literal
`**Method change:**` line. This was the borderline call. An existence check that
`touch method/log/S2.md` satisfies is a hollow guard; a real content check ("is
this log *honest*?") is unimplementable and would be resented. The line splits
the difference by checking **template use, not truthfulness** — it verifies the
writer opened `method/log/README.md` and filled in its shape, which is cheap for
anyone actually writing a log and impossible to satisfy by accident. `none` is a
valid value and the check accepts it; that is the point. It is gameable in about
four seconds, and gaming it is a deliberate act, which is a different failure
mode from the one that actually happened (forgetting).

The other four template lines are **not** checked. One marker is enough signal;
four more would be over-fitting to a format we may want to change.

## Why not more checks
Over-checking has a real cost: a check that fires on a legitimate state trains
everyone to ignore it, and an ignored red X is worse than no check, because it
also devalues the gate workflow's red X sitting next to it. Rejected candidates:

- **"Done stories must cite a merged PR / a demo date."** The status lines do
  today, but that is convention, not a rule anyone has written down, and the
  check would harden an accident into a format.
- **"`main` must equal `develop` after a Done story."** Refs, not artifacts, and
  wrong during the window between merge and demo — the exact window
  [ADR-0004](0004-git-flow-branching.md) creates on purpose.
- **Enforcing one-story-at-a-time (`## Doing` holds at most one).** Tempting and
  probably true, but it is a policy about *work in flight*, not about closeout,
  and `develop` exists precisely to allow parallel dev agents later.

## Trade-off
**This checks the artifacts of the human gate, never the gate.** It can prove
`method/log/S0.md` exists and has a `**Method change:**` line. It cannot prove
Alex ran the demo, that the demo worked, or that a word of the log is true. The
risk it introduces is a green check being read as "the human gate passed" — it
means only "nobody skipped the paperwork". Held in check by the workflow being
*named* `closeout` rather than something that sounds like approval.

Second cost: the check parses markdown with regexes. It is coupled to
`app/backlog.md`'s heading shape (`## Section`, `### S<n> — title`,
`**Status:**`). Restructure the backlog and the check goes quiet or noisy
without saying so. Mitigated by it printing the story count it found, so
`closeout: OK — 0 stories` is visibly wrong rather than silently green.

Revisit if either shows up:
- **It fires on a state we conclude is legitimate.** Then the rule is wrong, and
  the fix is to delete that rule, not to edit the backlog to appease it.
- **A closeout step is skipped that leaves no artifact** — e.g. `main` never
  fast-forwarded. Then this file is checking the wrong things and the next
  version checks refs.

## Alternatives rejected
- **More prose in `CLAUDE.md` or the DoD.** The rule was already written in two
  places when S0 broke it. ADR-0010 predicted this exact escalation.
- **A step inside `.github/workflows/gate.yml`.** That workflow is path-filtered
  to `app/**` excluding markdown *deliberately*, so it would not even trigger on
  a backlog edit; and its three named steps are the machine gate from the DoD.
  Mixing a fourth, different gate in makes a red X ambiguous
  ([ADR-0011](0011-one-gate-command-and-pipefail.md) keeps the steps named for
  the same reason).
- **Logic written inline in the workflow YAML.** Not runnable before pushing,
  which is where an agent or Alex would want it. A file in the repo runs in both
  places from one source.
- **A git pre-commit hook.** Not checked out with the repo, not run by agents,
  and bypassed by `--no-verify`. Would be an addition to CI, never a substitute.
- **A shell script instead of node.** Viable, and POSIX shell would have no
  runtime dependency at all. Node won because the parse is stateful (section →
  story → checkbox nesting) and `awk`/`sed` state machines are write-only; node
  22 is already required by `.github/workflows/gate.yml` and by `app/`.
- **A markdown-lint or schema dependency.** New dependency for a 90-line parse.
  Without it we write the parse ourselves — which is what we did.
