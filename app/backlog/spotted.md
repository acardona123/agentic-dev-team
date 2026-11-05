## Spotted
_Things agents noticed but were not allowed to fix. The session routes each entry to its owning role; the role returns a verdict; Alex confirms it._

- ~~`npm install` on Expo SDK 54 reports 18 advisories (9 moderate, 9 high).~~
  **Triaged 2026-08-25 — accepted, no action.** All 18 are transitive through the
  SDK's own tree, and 16 report `fixAvailable` only by upgrading `expo` itself,
  which [ADR-0007](../../method/adr/0007-expo-sdk-pinned-to-expo-go.md) forbids: the
  SDK is pinned to what Expo Go on the phone speaks. Every *high* is build-time
  tooling that never runs on the device (`metro*`, `@expo/cli`, `postcss`, `xcode`,
  `image-size`, `prebuild-config`) — it processes our own source on our own
  machine. Only `expo-asset`, `expo-constants` and `uuid` reach the phone, all
  moderate. `npx expo-doctor` is clean.
  **Re-open when:** a store build is cut. That build is not Expo Go, so the SDK
  pin dissolves and this list should be re-run against whatever SDK we move to.
  **Re-opened 2026-09-30 by S7.** The trigger above missed the case that actually
  happened: the SDK moved without a store build. On SDK 57 `npm install` reports
  13 advisories (11 moderate, 2 high). **Re-triage assigned to the architect**, not
  to Alex — it is a technical judgement (does it reach the phone, or only build
  tooling?). Pending the method work below, which gives this kind of task a home.

- `src/lib/` is kept React/Expo-free by convention only — nothing in the lint config
  enforces it, so the first stray `import { Platform } from 'react-native'` in a lib
  module will pass the gate. An ESLint `no-restricted-imports` override scoped to
  `src/lib/**` would make CLAUDE.md's code-style rule machine-checked. Out of S1's scope.
- There is no test that renders `App.tsx`, so AC1–AC5 are verified by eye on the phone
  only. `jest-expo` ships with `react-test-renderer` available; a component test would
  let the "no request on keystroke / no re-request for an unchanged query" rule (AC3,
  ADR-0009 obligation 3) be caught by the gate instead of by inspection. Needs a story
  and a decision on whether we take on `@testing-library/react-native` under the SDK
  pin ([ADR-0013](../../method/adr/0013-expo-sdk-follows-the-store-expo-go.md); was 54, now 57).
- ADR-0009 obligation 1 notes a browser silently strips `User-Agent`, so `npm run web`
  is not a valid target for the geocoding path. Nothing in the repo says so where a
  future session would look — `package.json` still exposes a `web` script.
- `searchAddress` returns `{ kind: 'empty' }` for a blank query, conflating "you typed
  nothing" with "the server matched nothing". Dead code today — `App.tsx`'s `isSearchable`
  guard means it is never reached — but S2+ callers that skip that guard would show
  "No results found." for an untouched field, and the fix in S1's scope
  (`searchCache`) now caches `empty` answers. Wants a distinct outcome or a thrown
  precondition. Left alone deliberately: out of S1's scope.
- Editing the search field does not invalidate the results already on screen.
  `onChangeText` (`App.tsx:73`) leaves `shown` and `listVisible` untouched: search
  "London", then type "Paris" without submitting, and the London rows stay under a
  field reading "Paris" — tapping one sets it as the selected target. Same shape
  mid-flight: edit while a request is in flight and the arriving results answer the
  old text. **Alex hit the other half on the phone demo:** the *selected target*
  also survives — start typing a different address and the previously chosen one
  is still displayed as the held target, which reads as though the app has already
  accepted the new text. Same root cause, same fix site. AC2 is satisfied as
  written ("tap a shown result → it becomes the target"), so this was out of S1's
  scope. S2 touches this screen and is the natural place to deal with it.
- `attribution: { flexShrink: 0 }` is a no-op — React Native already defaults
  `flexShrink` to 0, unlike CSS. The whole of the AC1 layout fix rests on
  `flexShrink: 1` on `list`. Recorded so a later reader does not mistake the
  redundant property for a deliberate second line of defence: keeping the
  attribution on screen ([ADR-0009](../../method/adr/0009-geocoding-via-nominatim.md)
  obligation 4) depends on one property, not two.
- Double-tapping Search can fire two requests. The `if (searching …) return` guard
  (`App.tsx:41`) reads a state value rather than a ref, so two taps landing inside
  one commit both observe `searching === false` and both dispatch. Low probability,
  but it lands on Nominatim's rate policy
  ([ADR-0009](../../method/adr/0009-geocoding-via-nominatim.md) obligation 2), not
  just on UX.
- **Dev-loop networking and DevTools — fixed by Alex on the machine, not yet in an
  ADR.** `npx expo start --tunnel` failed on 2026-09-30 (`CommandError: TypeError:
  Cannot read properties of undefined (reading 'body')`; the bundled ngrok 2.3.41
  showed the real cause, `ERR_NGROK_4018 — session not authenticated`; it reproduced
  on `develop` at SDK 54, so not S7). A WSL restart cured it once; **it recurred on
  2026-10-07.** Separately, React Native DevTools opened from the phone showed
  "127.0.0.1 refused to connect", and the `libasound.so.2` error was still printed
  at every start. Alex then changed the machine:
  - enabled **WSL2 mirrored networking** — the phone reaches the dev server again,
    and DevTools now opens;
  - installed **`libasound2`** (`libasound2t64` on Ubuntu ≥ 24.04).

  Both contradict [ADR-0006](../../method/adr/0006-test-and-lint-toolchain.md), which
  records libasound as absent and the ngrok tunnel as the way the phone connects,
  and neither is written anywhere a fresh machine would find it (rules 5 and 8).
  **Owner: the architect** — an ADR "how the phone reaches the dev server, and the
  machine prerequisites", superseding the relevant parts of ADR-0006, and stating
  whether `--tunnel` remains the documented start command. A tracked task under the
  method work below, not a story. S7's demo step 5 (our `User-Agent` under Expo's
  own `fetch`) was settled indirectly because DevTools was unusable at the time; it
  can now be checked directly.
- **Method gap, raised by Alex at S7 closeout (2026-09-30) — the next session starts
  here.** The method knows one kind of work, the phone-demoable story. Everything
  else (ADRs, Spotted triage, method edits, README) has no container, which is why
  `git log` holds a dozen `Method:` commits made straight on `develop` with no story
  or PR, and why the advisory re-triage above was deferred to Alex by everyone.
  Alex's rule: **every operation is motivated by a tracked work item**; if a needed
  task fits no scope, the scope definitions are wrong. Questions to work through,
  drawing on how real dev teams and current agentic-team practice handle them:
  1. *Work item types* — story vs task (no demo; its gate is Alex confirming a
     drafted deliverable). Are there others? Who triages Spotted (proposal: the
     session routes each item to the owning role; Alex only confirms verdicts)?
  2. *Priorities and planning* across those types; what the PO owns beyond writing
     one story (today it only writes; it neither orders nor grooms the backlog).
  3. *Agile/sprints* — which parts are useful to an agent team with one story in
     flight.
     **Rejected (2026-10-07).** Sprints and their ceremonies coordinate several
     humans working in parallel; here one story is in flight and the backlog order
     already says what is next. Anthropic's own long-running-agent harness dropped
     its sprint decomposition as scaffolding the model no longer needed. Nothing
     observed in S0–S7 failed for want of a sprint. Recorded as an alternative
     rejected in ADR-0014.
  4. *GitHub Issues* — the repo stays the **only** source of truth (Alex: absolute).
     Issues would be a progress view and PR↔work-item links, and would let CI check
     "every PR references a work item". The real problem is keeping them in sync
     with the repo, and the method that writes and syncs them; also its portability
     (it binds the method to GitHub).
     **Rejected (2026-10-07).** Issues would be a second copy of the state, kept in
     sync by hand or by tooling — the opposite of "the repo is the only source of
     truth" — and would bind a core method to one host. The one real need, "every
     PR references a work item", is checked by CI against `backlog.md` itself, by
     extending `method/check-closeout.mjs`
     ([ADR-0012](../../method/adr/0012-ci-check-for-story-closeout-artifacts.md)).
     Recorded as an alternative rejected in ADR-0014.
  5. *Kickoff decisions* — merge strategy is a per-project choice made at project
     start; the architect should guide a new project through such choices. For this
     project Alex chose **merge commits** (`--merge`): what QA and CI judged is what
     lands, per-step commits stay bisectable, `--first-parent` still gives one line
     per story. Needs a core ADR (kickoff decisions) and a project ADR (the choice).
     **Correction (2026-10-07):** the session told Alex "no ADR decides merge style"
     without reading the playbook — `manager-playbook.md` "Git, per story"
     prescribes `gh pr merge --squash`, so PR #4's squash *followed* the method.
     Alex's `--merge` choice therefore supersedes a written rule and must reconcile
     it, not fill a void. (Rule 8, broken by the dispatching session — the S1
     failure again.)
  6. *Why `main` is promoted by fast-forward, not by PR* — decided in
     [ADR-0004](../../method/adr/0004-git-flow-branching.md), `CLAUDE.md` and the DoD,
     but the reason is written nowhere: a fast-forward keeps `main` on the exact
     commit Alex demoed, while any GitHub PR merge (merge, squash or rebase) mints
     a new commit nobody demoed, and GitHub's UI offers no pure fast-forward.
     Alex asked; a future project will too. Add it to ADR-0004's alternatives
     rejected (core). Belongs in the same task as point 5.
  7. *A decision that contradicts an ADR is flagged when it is proposed, never
     after.* Raised by Alex 2026-10-07 — "très important, pour maintenant et pour
     la suite". Twice in S7's closeout the dispatching session saw a decision
     contradict written method and only filed it in Spotted afterwards: Alex's
     machine fix (WSL2 mirrored networking, libasound2) against
     [ADR-0006](../../method/adr/0006-test-and-lint-toolchain.md), and the session's
     own `--merge` recommendation against the playbook's squash. Rule to write
     (core, extends `CLAUDE.md` rule 8 — likely a rule edit plus an ADR): whoever
     sees a proposed decision contradict an ADR or method text says so **before it
     is acted on**, citing the text; if Alex validates it, it takes effect only
     together with the superseding ADR, in the same tracked work item. Consider
     whether QA or the closeout check can catch "behaviour or config that
     contradicts an accepted ADR" mechanically, as ADR-0012 did for logs.
  8. *Where each rule lives — prose, hook, CI, skill or plugin.* Added 2026-10-07
     from the research below. `CLAUDE.md` is advisory: the model reads it and may
     not follow it. Hooks in `.claude/settings.json` and tool limits in agent
     frontmatter are enforced by the harness; the repo has neither. The second
     slip foreseen by [ADR-0010](../../method/adr/0010-no-orchestrator-agent.md)'s
     "Revisit" has happened (S7, rule 8 — point 5's correction), so by its own
     condition a mechanical fix is due. Candidates, each tied to an observed
     failure: block agent commits/pushes on `develop`/`main`; make QA truly
     read-only; CI checks each PR names a work item present in `backlog.md`;
     branch protection on GitHub (Alex's action); `closeout.md` as a `/closeout`
     skill; a slimmer `CLAUDE.md`. Packaging the method as a plugin: decide "not
     now, at porting time" ([PORTING.md](../../method/PORTING.md)). Becomes T1's ADR,
     done as the first task once the task type exists.

  **Research verdict (session of 2026-10-07).** Sources: Claude Code documentation
  (memory/`CLAUDE.md`, hooks, subagents, skills, plugins); Anthropic engineering
  posts on agent harnesses ("every component in a harness encodes an assumption
  about what the model can't do on its own"); Cognition on multi-agent systems
  (one writer; reviewers in fresh context). They confirm the core of the method —
  writer ≠ reviewer in a fresh context, one writer at a time, machine gate before
  the human, state kept in the repo — and name two real risks: rules enforced by
  prose alone (point 8), and over-building (points 3 and 4). Guiding principle:
  fix only what an observed failure justifies, the minimum for S2 to run through a
  sound method, then let S2 test the method.

  **Plan, in order.** (1) ADR-0014, work-item types (points 1–4) — architect,
  Proposed, Alex's gate before its edits are applied. (2) T1's ADR, points 7 and
  8, as task T1 (Alex, 2026-10-07: the point 7 rule lands with "where each rule
  lives"). (3) Points 5–6 as T2 (needed before S2's PR merges), the dev-loop
  networking ADR as T3 (needed for S2's demo), the advisory re-triage as T4.
  (4) S2. Out of scope: sprints, GitHub Issues, plugin packaging, role redesign.
  (1b, Alex 2026-10-07, before this chantier's PR) An ADR lifecycle rule — an
  ADR is a draft, consolidated, until it reaches `develop`, and frozen after,
  changed only by supersession — and ADR-0014 consolidated under it, its QA
  checking that no decision was lost or changed. **Accepted at Alex's gate
  (2026-10-07):** [ADR-0015](../../method/adr/0015-adr-lifecycle.md) as drafted,
  taking number 0015 (T1's ADR takes the next free one); the PO's backlog
  writes land on the item's own branch from its first commit
  ([ADR-0014 §6](../../method/adr/0014-work-item-types.md#6-only-a-merged-pr-reaches-develop));
  and QA's A6/A7 fixes (playbook fast-forward fetch and pointer, log-line
  references named by field, `check-closeout.mjs` message).
  **(1) and (1b) Done** — PR #5, QA READY FOR ALEX on ff2b7c9 (2026-10-07).
  **(2) T1 Done** (PR #6, 2026-10-08). Next, in order (Alex, 2026-10-08): T7
  (his priority), T8, then T2–T6, then S2.

  **This entry is the work item for that work** — the one exception, since the
  task type it needs does not exist yet. It runs on branch `method/work-items`
  with a PR to `develop`; no more direct commits on `develop` from here on. The
  exception is to be written into ADR-0014.

  **Raised by the architect while drafting ADR-0014 (2026-10-07), not settled
  there:**
  - *QA's Bash allow-list.* `qa.md` limits QA to `git diff`, tests and typecheck;
    re-running a world-state observation (`gh api …`, `dpkg -s …`) needs it widened
    to "read-only observation commands". Word it when ADR-0014's `qa.md` edit is
    applied; T1's QA read-only hook, if it adds one, must allow the same set.
  - *World-state criteria if QA ever runs in CI.* A machine observation such as
    `dpkg -s libasound2` only means something on the dev machine, where QA runs
    today. **Trigger:** the day QA runs anywhere else, such criteria become
    Alex-witnessed — a future task, not now.

  The tasks queued above (advisory re-triage; dev-loop networking ADR; points 5–6 and 7–8)
  are the first candidates for the new work-item type — do them as tracked tasks
  once it exists, not before.
- **QA findings left out of the "Method gap" work item (QA on f3cfdfd,
  2026-10-07), not fixed there.** (1) `method/check-closeout.mjs` robustness: a
  `### T<n>` block placed outside `## Tasks` is silently ignored — with
  `## Done / ### T1 / Status: Done / - [ ] CC1` the script exits 0, and moving a
  block under `## Done` the way stories move is a natural mistake; and a T block
  sitting under a story section has its checkboxes and Status counted against
  the preceding story block. (2) Spotted verdict wording: the dev-loop
  networking and SDK 57 advisories entries above do not yet carry the "becomes a
  task (T3/T4)" verdict that ADR-0014 §4 wants written into each entry, and the
  "Method gap" entry's last paragraph still said "points 5–7" where T1/T2 split
  them as 7–8 and 5–6 (wording fixed 2026-10-08, T7 planning). (3) `check-closeout.mjs` has no tests (QA on T1,
  2026-10-08): T1's CC8 "(including its tests)" passed vacuously. The tests
  are T8's, which modifies the script, not T5's.
- ~~**Agents merging and pushing `main` vs `CLAUDE.md`** (QA, 2026-10-07; predates
  the "Method gap" work item).~~ **Triaged 2026-10-08 — becomes part of T2 (Alex's
  decision).** Merging a PR is Alex's only, never an agent's, even on instruction,
  so the DoD's "or by an agent on Alex's explicit instruction" clauses go. The
  non-PR git operations of the closeout — fast-forwarding `main` and pushing it —
  an agent may run on Alex's explicit, one-shot consent given at that moment;
  `CLAUDE.md`'s wording is nuanced accordingly. Original finding: `CLAUDE.md` `## Git workflow` says "Agents never
  push to `main` or `develop`, and never merge a PR", but the
  [DoD](../../method/definition-of-done.md) Human gate lets an agent merge on Alex's
  explicit instruction for that specific PR (the S1 exception, now extended to
  the closeout PR and task PRs), and [closeout.md](../../method/closeout.md) Beat 2
  says "He may tell you to do all of it. Do it", which covers `git push` of
  `main`. The two texts disagree on whether an agent may ever merge or push
  `main`.
- **Playbook orders the merge after the demo** (QA, 2026-10-07; predates the
  "Method gap" work item). `method/manager-playbook.md` "What to literally type",
  step 7: "`gh pr merge --squash` — after you've seen it on the phone". That
  contradicts the order fixed in the DoD and ADR-0014 §2 (merge story PR → demo
  D → fast-forward `main` to D → closeout PR). The squash lines are T2's
  (merge style), so this belongs in T2's completion criteria.
- ~~**No status for a drafted, not-yet-approved work item** (session, T1 draft,
  2026-10-07).~~ **Triaged 2026-10-08 — becomes task T8.** Original finding: [ADR-0014 §6](../../method/adr/0014-work-item-types.md#6-only-a-merged-pr-reaches-develop)
  makes Alex's approval the Status → Ready commit, so the PO's draft (the
  branch's first commit) needs a status before Ready. None exists: ADR-0014 §1's
  table, the `po.md` templates (which write `**Status:** Ready` directly) and
  `method/check-closeout.mjs` know only Ready / Doing / Review / Done. T1's
  draft used `Draft`, and `node method/check-closeout.mjs` exits 1 on that
  commit. Harmless for CI, which checks the PR head, but every draft commit is
  red locally and nothing says how a draft is written.
- ~~**Nothing says when an item's one-line `## Backlog` entry is removed** (Alex,
  T1 draft, 2026-10-07).~~ **Triaged 2026-10-08 — becomes part of task T8 (Alex's
  decision).** The one-liner stays in `## Backlog` while the item is
  Ready/Doing/Review (it may be updated after Ready, and an item in progress
  should be visible there, e.g. after a pause); it is removed only when the item is
  Done — for a task, in its Done commit (the branch's last commit, ADR-0014 §3).
  The `## Backlog` heading's "not yet refined" wording changes with it. Original
  finding: once an item is refined into its own block, does its
  one-liner leave `## Backlog`, and at which commit (the PO's draft, the
  `approved Ready` commit, or the merge)? S7 no longer appears there, but no
  text records the practice. T1's one-liner is left in place until this is
  decided.
- **Task/story relation for technical decisions** (Alex, 2026-10-08; not triaged).
  `CLAUDE.md` rule 9's pipeline, `po → (architect) → dev`, puts the architect
  *inside* a story, while [ADR-0014](../../method/adr/0014-work-item-types.md) §1's
  table classes "an ADR" as a task. Nothing says which wins, which precedes which,
  or what happens when a technical decision arises mid-story. Until now technology
  choices were made within stories. S2 is blocked on exactly this case (its ADR on
  how the app obtains position). **To be settled before S2.** Raised during the T7
  ordering; deliberately not acted on now — focus stays on the Method gap work.
- ~~**Re-approval after an amendment is unwritten** (session, 2026-10-08).~~
  **Triaged 2026-11-05 — becomes part of task T8 (Alex's decision).** An amendment
  to an approved item sets its Status back to `Draft`; only Alex's `approved Ready`
  commit moves it to `Ready`, every time. Original finding: [ADR-0014](../../method/adr/0014-work-item-types.md) §6 makes
  Alex's approval "the Status → Ready commit", but says nothing of an item amended
  after approval. In T7 the session had the PO set `Ready` inside both amendments
  (f8814e6, 80e582e), leaving Alex's `T7: approved Ready` commits empty (41078bb,
  acae7a1). The freeze point held; the record did not. Fix: an amendment leaves
  Status unchanged, and Alex's re-approval commit is the one that moves it to `Ready`.
