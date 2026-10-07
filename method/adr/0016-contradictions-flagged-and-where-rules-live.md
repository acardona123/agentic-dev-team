# 0016 — A contradiction is flagged before it is acted on; a rule leaves prose only for an observed failure
**Status:** Proposed · **Date:** 2026-10-07  
**Scope:** core — binds to GitHub as the host (branch protection, Actions) and
to Claude Code as the harness (hooks, agent frontmatter, skills, plugins); a
project on another host or harness substitutes the equivalent mechanism, not
the rule. The branch names `develop`/`main` follow
[ADR-0004](0004-git-flow-branching.md).

## Context
Two gaps, both raised under "Method gap" in `app/backlog.md` `## Spotted`
(points 7 and 8).

**Contradictions were filed after the fact.** Twice in S7's closeout the
dispatching session saw a decision contradict written method and recorded it in
`## Spotted` only afterwards: Alex's machine fix (WSL2 mirrored networking,
`libasound2`) against [ADR-0006](0006-test-and-lint-toolchain.md), and the
session's own `--merge` recommendation against `manager-playbook.md`'s
`gh pr merge --squash`. `CLAUDE.md` rule 8 says to read an ADR before deviating
from it; it says nothing about *when* a contradiction seen in someone else's
proposal must be raised, nor what has to travel with it if it is accepted.

**Every rule of the method lives in prose.** `CLAUDE.md` and the role files are
context, not enforced configuration — Claude Code's own memory documentation
says so, and points to a `PreToolUse` hook "to block an action regardless of
what Claude decides". The repo has no hook, no `.claude/settings.json`, no
branch protection (`gh api …/branches/develop/protection` → 404, 2026-10-07),
and one CI check per gate. Point 8 lists seven candidate mechanisms. The
research recorded with it, and [ADR-0014](0014-work-item-types.md), set the
test each must pass: fix only what an observed failure justifies.

## Decision

### 1. A contradiction is flagged before it is acted on
Whoever sees a proposed decision contradict an ADR or method text — Alex's,
another agent's, or their own — says so **before it is acted on**, citing the
text it contradicts. If Alex validates the decision anyway, it takes effect
only **together with the ADR that supersedes the contradicted text** (or the
method edit, for text that is not an ADR), in the same tracked work item. Not
after, in `## Spotted`; not in a later item. A contradiction noticed after the
fact is still recorded in `## Spotted`, and recorded as a slip of this rule.

It lives in prose: `CLAUDE.md` rule 8 carries one sentence pointing here.

### 2. Where a rule lives
A rule starts in prose. It moves to a mechanism only when the prose is
**observed** to fail — a log, a story or a `## Spotted` entry records the
breach — and then into the cheapest mechanism that catches that failure where
it happens. When two mechanisms would catch it, the one that binds **every
actor** (CI, a host setting) beats one that binds only agents (a harness hook),
because agents here run under Alex's git identity and `gh` token, and a check
on the shared ref cannot be bypassed from a local shell. A candidate with no
observed failure is recorded with the trigger that would reopen it, and not
built.

### 3. The seven candidates
Accepted mechanisms are built by their own follow-up tasks, not here.

**(a) Block agent commits and pushes on `develop`/`main` — not now.**
*Would live in:* a `PreToolUse` hook on `Bash` in `.claude/settings.json`
(project hooks fire for subagents' tool calls too). *Observed failure:* real —
from 9e452dd, `CLAUDE.md` said `develop` moves only by merged PR and agents
never push it, and twenty-seven commits landed on `develop` directly
afterwards (`Method:`, `ADR-00NN:`, `Backlog:` commits, 0234db3, 8715676,
951d36d; the last, 94121be, on 2026-10-07). *Why not now:* (d) and (c) close that failure
on the shared ref for every actor; a local commit on `develop` that cannot be
pushed harms nobody. A hook adds a script on every agent `Bash` call, and a
misfiring one stops the whole team. *Open question it depends on:* the
`## Spotted` entry **"Agents merging and pushing `main` vs `CLAUDE.md`"** —
`CLAUDE.md` forbids an agent ever pushing `main` or merging, while the DoD and
`closeout.md` Beat 2 let one do both on Alex's explicit instruction. A hook that
blocks `git push` to `main` or `gh pr merge` would silently enforce the first
reading. Until that entry is resolved, the only part a hook may carry is "no
`git commit` while `HEAD` is `develop` or `main`", which both readings agree
on. *Reopen when:* after (d) is in force, an agent commit on local `develop` or
`main` is observed, or (d) cannot be applied.

**(b) Make QA read-only in the harness — not now.** *Would live in:* agent
frontmatter. *Observed failure:* none. No log or Spotted entry records QA
writing anything. `qa.md`'s `tools` already omits `Edit` and `Write`; `Bash` is
the remaining path, and is limited by prose only. *Reopen when:* QA is
recorded making any write (a file edit, a commit, a `gh` write). The mechanism
then is a `PreToolUse` hook in `qa.md`'s frontmatter that allows only the
command set below. A `tools` entry cannot pattern-limit `Bash`, and a
`permissions.deny` rule binds the whole session, not QA alone.

*Allowed set (CC6):* none is accepted, so `qa.md`'s list of "read-only
observation commands" stays the only statement of QA's command set, and the two
are consistent by default. `qa.md` already states that any harness-enforced
read-only rule must allow exactly that list. A future hook takes it verbatim.

**(c) CI check that every PR names a work item in `backlog.md` — accepted.**
*Lives in:* CI — `method/check-closeout.mjs`, extended, run by its own workflow
on **every** pull request, with no path filter, under its own job name.
*Observed failure:* the direct commits under (a), which carried no work item,
and PRs before ADR-0014 that carried none (#3, a README pass). [ADR-0014](0014-work-item-types.md)'s
trade-off also records that a method-only task gets no CI signal and that "T1's
ADR is to add a CI check that runs on every PR". This is that check. *Shape:*
the PR's head branch must match `story/S<n>-…` or `task/T<n>-…`, and `<n>` must
have its `### S<n>` / `### T<n>` block in `app/backlog.md` at the PR head. The
follow-up decides how `hotfix/` and `release/` branches, both unused today, are
treated. It gets its own workflow because [ADR-0012](0012-ci-check-for-story-closeout-artifacts.md)'s
`closeout` workflow is path-filtered by decision, and a red X here names a
different failure. No new dependency, for the same reason ADR-0012 gives.

**(d) Branch protection on GitHub — accepted.** *Lives in:* a GitHub setting,
applied by Alex (admin), and observed read-only via `gh api` GET.
*Observed failure:* the direct commits under (a). That prose rule was broken
twenty-seven times. *Shape:*
- `develop`: a pull request is required, applies to admins too (agents hold
  Alex's token, so an admin bypass is an agent bypass), no force-push, no
  deletion; the required status check is (c)'s job only. `gate` and `closeout`
  are path-filtered, so on a PR they skip they would never report and would
  block it.
- `main`: no force-push, no deletion — **no** PR requirement. `main` moves by
  a fast-forward push of the demoed commit
  ([ADR-0014 §2](0014-work-item-types.md#2-closing-a-story)), and any PR
  merge would mint a commit nobody demoed. Server-side, an agent and Alex are
  the same identity, so this setting takes no side in the open question under
  (a).
- Allowed merge methods are left alone; they are T2's decision.

**(e) `closeout.md` as a `/closeout` skill — not now.** *Would live in:*
`.claude/skills/closeout/SKILL.md`. *Observed failure:* none since rule 10. The
failures closeout fixed — S0 without its log, S7's bookkeeping straight on
`develop` and `main` moved past the demoed commit — were gaps in the
procedure, not a session failing to load it. A skill also loads on demand, as
`closeout.md` already does via rule 10, and moves a `method/` file into the
harness's directory. *Reopen when:* a closeout is recorded in which the session
did not read `closeout.md`, so Alex had to recall a Human-gate item unprompted.

**(f) A slimmer `CLAUDE.md` — not now.** *Would live in:* prose moved to
`method/` or path-scoped rules. *Observed failure:* none attributable to
length. The prose slips on record (S1, S7) were rules that were loaded and not
followed, and trimming does not fix that. `CLAUDE.md` is 177 lines with this
ADR's sentence; Claude Code's documentation targets under 200 and warns at
startup past that. *Reopen when:* that warning appears, a log attributes a slip
to a rule lost in length, or [ADR-0010](0010-no-orchestrator-agent.md)'s
"dispatcher block outgrows a screen" signal fires.

**(g) Packaging the method as a plugin — not now, at porting time.** *Would
live in:* a Claude Code plugin. *Observed failure:* none. One repo uses the
method. A plugin is the shipping format for its first port
([PORTING.md](../PORTING.md)), and packaging it before then means guessing the
interface. *Reopen when:* a second project adopts the method.

### 4. A mechanical check for "behaviour or config that contradicts an accepted ADR"
**Not feasible as a general check, now or later.** Telling whether a change
contradicts an ADR means reading the ADR's prose against the change. Neither
observed case would have reached such a check anyway: one was a change to the
machine and the other a recommendation in conversation, so neither left a diff
at decision time. Who catches it:
- **at decision time, in conversation:** whoever sees it, under §1 — prose,
  because no artifact exists yet;
- **in a diff:** QA, by reading, since rule 8 binds every agent. An in-force
  ADR's own text is protected by QA's frozen-body check
  ([ADR-0015](0015-adr-lifecycle.md)).

**Feasible narrowly, per ADR:** where an ADR states a machine-checkable
invariant, that invariant can earn a check the way
[ADR-0012](0012-ci-check-for-story-closeout-artifacts.md) earned one — after it
is observed broken, not before. *Reopen when:* a diff contradicting an
accepted ADR reaches `develop` past QA.

### 5. ADR-0010's "Revisit" condition
[ADR-0010](0010-no-orchestrator-agent.md) names "a second gate-order or
self-implementation slip" as the signal that prose is not enough. The S7 slip —
the session told Alex no ADR decided merge style, without reading the playbook
that does — was a rule-8 slip. **Not met as worded; met in kind.** It is the
same root cause ADR-0010 records for S1, recommending from memory, but it
neither reordered a gate nor implemented a story. ADR-0010 is not edited
([ADR-0015](0015-adr-lifecycle.md)). The mechanical remedy it names — a check
that fails a direct `develop` commit — is adopted here as (c) and (d). It is
justified by the direct-commit failures under (a), not by the S7 slip, which
no mechanism could have caught, since it was spoken before any artifact
existed. §1 is the answer to that slip.

## Trade-off
**§1 is still prose, and its observed failures were prose failures.** This ADR
adds no detector for the very slip that prompted it. A conversational
contradiction leaves no artifact to check. Signal: a third contradiction is
filed after the fact. Then the next step is a structural one, such as
the session quoting the ADR it relied on in every recommendation, not more
wording.

**Branch protection is a setting outside the repo.** It is invisible in
`git diff`, can be changed in the UI without a trace, and does not port with
`method/`. The world-state record of its follow-up is a snapshot
([ADR-0014](0014-work-item-types.md)). With admins included, Alex also loses
the direct push to `develop`. He does not use it, and a hotfix goes by PR.
Signal: the setting is found changed, or blocks a legitimate merge — then the
required-check list is wrong, not the rule.

**(c) can only check a name.** It proves the branch names an item that exists.
It cannot prove that the diff is that item's work — that stays QA's. Signal: a PR
passes (c) with an unrelated diff that QA misses.

**The "not now" list rests on recorded failures only.** A failure nobody logged
does not count, so the trigger for each one depends on the logs and `## Spotted`
being kept.

**Without (a), a local `develop` can still diverge** until the push is refused.
That is accepted as a local cost.

## Alternatives rejected
- **Build all seven now.** Over-building is the risk the research named, and
  every hook is a script Alex would debug.
- **A hook for (a) that also blocks pushing `main` and `gh pr merge`.** It would
  settle the open `## Spotted` question by mechanism instead of by decision.
- **`permissions.deny` in `.claude/settings.json` for QA.** It applies to the
  whole session, the dispatcher included, not to QA alone.
- **Requiring `gate` and `closeout` as status checks on `develop`.** They are
  path-filtered, so a PR they skip would wait for them forever.
- **A PR requirement on `main`.** Every GitHub merge method mints a commit
  nobody demoed. `main` moves by fast-forward push.
- **(c) inside the `closeout` workflow.** ADR-0012 path-filters that workflow
  by decision, and two kinds of failure behind one red X make it ambiguous.
- **A mechanical "contradicts an ADR" check by keyword or LLM review in CI.** A
  keyword check fires on correct states (the reason
  [PORTING.md](../PORTING.md) rejected its leakage grep), and an LLM reviewer in
  CI duplicates QA with less context.
- **Counting the S7 slip as meeting ADR-0010's condition as worded.** It is not a
  gate-order or self-implementation slip. Reading it so would stretch a frozen
  ADR's text instead of deciding here.
