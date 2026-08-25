# 0011 — One `gate` command, and `pipefail` when its output is trimmed
**Status:** Accepted · **Date:** 2026-08-25

## Context
The machine gate was three scripts every agent composed by hand
(`npm run typecheck && npm test && npm run lint`). Gate output is long, so a
session reporting it trims it — and a trimmed pipeline reports the *filter's*
exit status, not the gate's.

This is not hypothetical. It has happened twice:

- S0 (`method/log/S0.md`, "one process detail"): `npm test` piped through `tail`,
  reported `GATE EXIT: 0` on a red gate. Caught in the same turn.
- 2026-08-25, this session's dispatcher, several times:
  `npm test --silent 2>&1 | grep -E "Tests:|Test Suites:"` — the identical flaw
  wearing a different filter.

Both times the *visible output was honest*; only the status line lied. That is
what makes it dangerous. Reproduced here, with a gate whose lint step fails and
a `grep` that shows only the passing test summary:

    $ npm run --silent gate 2>&1 | grep -E 'Tests:'; echo "GATE EXIT: $?"
    Tests: 3 passed, 3 total
    GATE EXIT: 0          # lint exited 1; grep exited 0; nothing on screen says so

Shells default to reporting only the last command in a pipeline. Coming from C:
it is the same class of bug as ignoring the return value of the call you actually
cared about because you only checked the wrapper's.

## Decision
1. `app/package.json` gains **one** script:
   `"gate": "npm run typecheck && npm test && npm run lint"`.
   One invocation, one exit code, nothing left to compose wrongly.
2. The invocation an agent must use when it intends to trim the output is

       set -o pipefail; cd app && npm run gate 2>&1 | tail -30; echo "GATE EXIT: $?"

   `pipefail` makes the pipeline take the status of the first failing stage, so
   the exit code survives any filter. It is a POSIX-2024/bash/zsh option; Alex's
   shell is zsh and it is valid there. Verified in both, with the same one-liner:
   a failing middle step gives `GATE EXIT: 1` through `tail` and through `grep`,
   and the passing real gate gives `GATE EXIT: 0`.
3. `CLAUDE.md` rule 3 carries the one-liner and cites this ADR.

`pipefail` over `${PIPESTATUS[0]}`: bash indexes `PIPESTATUS` from 0 and zsh
indexes `pipestatus` from 1 under a different name, so the array form is a
portability trap in a repo whose agents run under both.

## Trade-off
- `&&` stops at the first failure, so a run can fix typecheck only to meet a lint
  failure it could have seen. Accepted: CI's three steps stop at the first failure
  too, and a gate that keeps going has to invent a merge rule for three statuses.
- `set -o pipefail` is per-shell-invocation state. The Bash tool does not persist
  shell options between calls, so the option must be re-stated in every gate
  one-liner. A rule that must be retyped each time is a rule that can be forgotten
  — this ADR reduces the failure rate, it does not make it impossible. The signal
  that this was not enough: a third occurrence in a log. Then the fix escalates to
  a checked-in `method/gate.sh` that writes its status to a file the report must
  quote, removing the human from the loop entirely.
- Two ways to run the gate now exist (`npm run gate` and the three scripts CI
  names). Divergence is the risk; the scripts are one line apart and both live in
  `app/package.json`, so it is visible.

## CI deliberately does not use `gate`
`.github/workflows/gate.yml` keeps typecheck, test and lint as three separately
named steps, and is unchanged by this ADR. A red X then names the failing gate on
the PR page without opening the log — worth more than the deduplication. CI also
never had this bug: it invokes each script directly, and GitHub Actions fails a
step on a non-zero status with no pipe in between. The `gate` script is a
convenience for humans and agents at a terminal, and `.github/workflows/gate.yml`
remains the authority (`method/definition-of-done.md`).

## Alternatives rejected
- **A rule that says "never pipe the gate."** Obeyed until the output is
  inconvenient, which is exactly the moment it matters. Rules that lose to
  convenience are not controls.
- **`npm run gate > /tmp/gate.log; echo $?; tail /tmp/gate.log`.** Correct, and
  three concepts long. Under pressure agents will collapse it back to a pipe.
- **Making `gate` a shell script under `method/`.** More moving parts than a line
  in `package.json`, and it would need its own path convention. Held in reserve as
  the escalation above.
- **Dropping `--silent`/filters and always pasting full output.** Costs tokens on
  every run for a problem that only bites on failure ([ADR-0005](0005-token-budget.md)).
