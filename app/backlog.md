# Backlog — Almost There

Single source of truth. A work item moves: **Backlog → Ready → Doing → Review → Done**.
Only Alex moves a work item to **Done** — a story only after seeing it work on his
phone, a task after reading its deliverable
([ADR-0014](../method/adr/0014-work-item-types.md)).

---

## Ready

_(empty)_

---

## Backlog (not yet refined — the PO turns these into stories or tasks, one at a time, and owns this order: top is next)

- **T7 — Register of ADR revisit triggers, evaluated by QA at every verdict.** 11 of 16 ADRs carry a revisit signal that no step ever reads (ADR-0007's premise fell in S7 unread). One-line index pointing to each ADR; QA reports "triggers fired: none / ADR-00xx" in each verdict; CI checks the register is complete. Owner: architect (then `qa.md`, `closeout.md`). Alex rates it high priority, as a guard on every item; placed first by Alex, 2026-10-08.
- **T8 — Backlog structure and lifecycle, for human and AI reading at low token cost.**
  Widened by Alex (2026-10-08) to a full review of the file's structure and
  upkeep, not only the two gaps below. Observed: T1 is Done yet sits in `## Tasks`,
  not `## Done` — `## Tasks` and stories should show items in progress only;
  `## Doing` and `## Review` are present but empty; `## Spotted` mixes done,
  pending and rejected entries in one list. Token economy is a criterion. Note
  QA's finding that `check-closeout.mjs` ignores a `### T<n>` block outside
  `## Tasks` — any move of Done blocks must carry the script along. Also
  covers the Spotted entries "No status for a drafted, not-yet-approved work item"
  and "Nothing says when an item's one-line `## Backlog` entry is removed" (verdict:
  the one-liner stays while the item is Ready/Doing/Review and is removed only when
  it is Done, in a task's Done commit; the `## Backlog` heading's "not yet refined"
  wording changes accordingly). Owner: po (`po.md` templates, backlog header), plus
  `method/check-closeout.mjs` accepting `Draft`, whose owner the task will name.
- **T2 — Merge style as a kickoff decision; why `main` moves by fast-forward.**
  Points 5 and 6 of the "Method gap" entry. Owner: architect. Needed before S2's PR merges.
  Also carries the verdict on "Agents merging and pushing `main` vs `CLAUDE.md`":
  merging a PR is Alex's only, never an agent's, even on instruction (the DoD's "or by
  an agent on Alex's explicit instruction" clauses go); fast-forwarding and pushing
  `main` an agent may do on Alex's explicit one-shot consent given at that moment;
  `CLAUDE.md`'s wording is nuanced accordingly.
- **T3 — ADR: how the phone reaches the dev server, and the machine prerequisites.**
  The "Dev-loop networking and DevTools" entry in `## Spotted`; supersedes the
  relevant parts of ADR-0006. Owner: architect. Needed for S2's demo.
- **T4 — Re-triage the SDK 57 `npm install` advisories.** The re-opened advisories
  entry in `## Spotted`. Owner: architect.
- **T5 — CI check: every PR's branch names a work item in `backlog.md`.** ADR-0016 §3(c). Owner: architect.
- **T6 — Branch protection on `develop` and `main`.** ADR-0016 §3(d); after T5, whose job is the required check. Owner: architect specifies, Alex applies.
- **S2 — Live position.** Ask location permission, stream position, show live distance to the target.
  **Blocked on an ADR (2026-08-25).** The PO was asked to refine this and stopped
  on `CLAUDE.md` rule 8: nothing in `method/adr/` decides how the app obtains the
  phone's position. ADR-0001 mentions only that *background* location will need a
  dev build later; no mechanism is committed to even for foreground. Writing the
  ACs would have meant silently deciding the permission flow, what "streams"
  means operationally (poll vs watch, interval or distance threshold), and the
  shape of the injectable seam — which per the S5 note below is what decides
  whether the fake-position harness is cheap or a rewrite.
  **Next step:** architect writes that ADR, same shape as
  [ADR-0009](../method/adr/0009-geocoding-via-nominatim.md) was for geocoding.
  Then the PO writes S2 from the same one-sentence intent: *"I want to see how
  far I am from the address I picked, updating as I move."*
- **S3 — Arm/disarm + radius.** Choose 200/500/1000 m, arm the alarm, armed state is unmistakable.
- **S4 — Alarm fires.** Inside the radius → sound + vibration + unmissable screen + dismiss.
- **S5 — Desk test harness.** Feed fake positions so the alarm can be tested without riding a bus.
- **S6 — Recent searches.** Show previously found addresses as you type, so a
  repeated journey is one tap instead of retyping. Raised by Alex after the S1
  demo. **Note for whoever refines this:** offering *local* history on keystroke
  is **not** a breach of [ADR-0009](../method/adr/0009-geocoding-via-nominatim.md)
  obligation 2 — nothing goes over the wire. The obvious implementation drifts
  into live autocomplete, which the policy prohibits in as many words. The line
  is the network call, not the dropdown.

> S5 looks like a detour and is the most valuable item here. If you can't test it
> from your desk, you can't manage it.
>
> **Refined after S1 (2026-08-25).** The story that needs it is **S4**, not S2:
> "show live distance" is demoable at a window, and S3 is UI state, but "alarm
> fires within 200 m" means physically getting within 200 m of somewhere — once
> per test, and again after every fix. It also cannot be built *before* S2, since
> there is no position pipeline to feed until S2 defines one. So the order stands:
> S7 → S2 → S3 → S5 → S4. (S7, the SDK move, was added 2026-09-30 and goes first
> so S2's location support is not built on SDK 54 and then upgraded.)
>
> What decides whether S5 is a two-hour story or a rewrite is **how S2 is
> implemented**. If the position source is injected — the way S1 injected `fetch`
> as `FetchLike` — faking it is nearly free. If `expo-location` is wired straight
> into the component, S5 means gutting S2. Hence the code-style rule in
> `CLAUDE.md`: a device capability is taken as a parameter, never reached for.

---

## Tasks

_Refined tasks live here as `### T<n> — title` blocks with a
`**Status:**` line: Ready / Doing / Review / Done._

### T1 — Contradictions flagged at decision time, and where each rule lives
**Status:** Done · confirmed by Alex 2026-10-08 · [PR #6](https://github.com/acardona123/agentic-dev-team/pull/6) · [ADR-0016](../method/adr/0016-contradictions-flagged-and-where-rules-live.md)
**Intent:** "Write down that a decision contradicting an ADR is flagged when it is proposed, never after, and decide where each rule of the method lives — prose, hook, CI, skill or plugin."
**Owner:** architect

**Scope choice (PO, stated explicitly).** T1 **decides and writes down; it
implements no hook, no CI check, no skill and no GitHub setting.** Each
mechanism the ADR accepts becomes its own queued follow-up task, so that every
enforcement change is its own diff, reviewed on its own. The only edits T1
makes outside the ADR are the rule text in `CLAUDE.md` and the pointers that
ADR-0016 needs. Basis: the research verdict's principle, "fix only what an
observed failure justifies".

**Completion criteria**
- [x] CC1 — *diff* — `method/adr/0016-*.md` exists, tagged `**Scope:** core`, status Proposed (draft, consolidated per [ADR-0015](../method/adr/0015-adr-lifecycle.md)), and states the rule of point 7: whoever sees a proposed decision contradict an ADR or method text says so **before it is acted on**, citing the text; if Alex validates it, it takes effect only together with the superseding ADR, in the same tracked work item.
- [x] CC2 — *diff* — `CLAUDE.md` rule 8 is extended with that rule (or a rule beside it that rule 8 points to), in prose short enough not to grow the file noticeably, citing ADR-0016 rather than restating it; no other rule is reworded.
- [x] CC3 — *diff* — ADR-0016 has one entry for each candidate mechanism of point 8 — (a) block agent commits/pushes on `develop`/`main`; (b) make QA read-only; (c) CI check that each PR names a work item present in `backlog.md`; (d) branch protection on GitHub; (e) `closeout.md` as a `/closeout` skill; (f) a slimmer `CLAUDE.md`; (g) packaging the method as a plugin — and for each states: where the rule lives (prose, hook, agent frontmatter, CI, GitHub setting, skill, plugin), **the observed failure that justifies it**, citing the log, story or Spotted entry, or **"no observed failure — not now"** with the trigger that would reopen it. (g) is expected to read "not now, at porting time" ([PORTING.md](../method/PORTING.md)).
- [x] CC4 — *diff* — ADR-0016 states, for the mechanical check named in point 7's last sentence ("behaviour or config that contradicts an accepted ADR"), whether it is feasible and by whom; if not feasible now, says so and why, rather than leaving it silent.
- [x] CC5 — *diff* — ADR-0016 records whether [ADR-0010](../method/adr/0010-no-orchestrator-agent.md)'s "Revisit" condition (second slip after prose) is now met, citing the S7 rule-8 slip, and does not edit ADR-0010 (frozen; change only by supersession per ADR-0015).
- [x] CC6 — *diff* — If ADR-0016 accepts a QA read-only mechanism, it states the allowed command set and that this set is the same as the "read-only observation commands" QA's Bash allow-list in `qa.md` permits (the allow-list item raised while drafting ADR-0014); if it accepts none, it says the two stay consistent by default.
- [x] CC7 — *diff* — For every mechanism ADR-0016 accepts, `app/backlog.md` `## Backlog` gains one one-line follow-up entry (next free T-number, owner named), added as a separate `T1: backlog — …` commit confined to that section; none of them is implemented in this branch.
- [x] CC8 — *diff* — `set -o pipefail; cd app && npm run gate` exits 0, and `method/check-closeout.mjs` (including its tests) passes against the branch.

**Not in scope**
- Implementing any hook, CI workflow, `settings.json` entry, agent-frontmatter change, skill or plugin; each is a follow-up task (CC7).
- Applying branch protection on GitHub. If ADR-0016 accepts it, it is a follow-up task whose world-state criterion Alex witnesses or QA observes via `gh api`; T1 itself has no world-state criterion.
- Merge style and why `main` is fast-forwarded (points 5–6) — T2. The playbook's merge-after-demo ordering line — T2.
- The "QA findings left out of the Method gap work item" Spotted entry (`check-closeout.mjs` robustness, Spotted verdict wording): not T1's; a separate task, to be triaged by the session.
- The "Agents merging and pushing `main` vs `CLAUDE.md`" Spotted entry: not T1's to resolve. Note for the architect: any hook accepted under CC3(a) must not encode one reading of that disagreement silently; ADR-0016 names the entry as the open question it depends on.
- Sprints, GitHub Issues, plugin packaging, role redesign (rejected or deferred in the "Method gap" entry).
- Triaging Spotted entries, or editing any frozen ADR.

### T7 — Register of ADR revisit triggers, evaluated by QA at every verdict
**Status:** Ready
**Intent:** "A register of ADR revisit triggers, evaluated by QA at every verdict: 11 of 16 ADRs carry a revisit signal that no step ever reads (ADR-0007's premise fell in S7 unread)."
**Owner:** architect (then `qa.md` and `closeout.md` edits as part of the same task)

**Scope choice (PO).** T7 makes the revisit signals *read*. It does not
re-evaluate any ADR, edit any frozen ADR (change only by supersession,
[ADR-0015](../method/adr/0015-adr-lifecycle.md)), or decide whether any trigger
has in fact fired beyond recording the register's initial state.

**Completion criteria**
- [ ] CC1 — *diff* — A register file exists (location chosen by the architect and justified in an ADR or in the file) with one line per ADR in `method/adr/`, each pointing to its ADR and stating its revisit trigger in one line, or "none stated". The 11 ADRs that carry a revisit signal each have a trigger line.
- [ ] CC2 — *diff* — `qa.md` requires every QA verdict to include a line `triggers fired: none` or `triggers fired: ADR-00xx[, …]` with the observed evidence for each fired trigger, and says QA evaluates the register against the diff and the item's evidence at each verdict.
- [ ] CC3 — *diff* — `method/closeout.md` (including its task closeout part) reads that verdict line, so a fired trigger reaches Alex as a drafted item for him to confirm or reject, not something he must recall.
- [ ] CC4 — *diff* — A CI check (or an extension of an existing one such as `method/check-closeout.mjs`) fails when an ADR in `method/adr/` has no register entry, or a register entry points to no ADR. The architect justifies the mechanism choice per [ADR-0016](../method/adr/0016-contradictions-flagged-and-where-rules-live.md).
- [ ] CC5 — *diff* — Any logic added or extended in `method/check-closeout.mjs` or any other script has tests that fail when the logic is broken (e.g. an ADR missing from the register). If tests are not meaningful for the chosen mechanism, the architect flags that, with the reason, **before producing**, and the criterion is then replaced by the stated alternative proof, with Alex's agreement.
- [ ] CC6 — *diff* — The register's initial state records ADR-0007's trigger as fired (premise fell in S7), citing the S7 log, with no edit to ADR-0007 itself; any other already-fired trigger found while building the register is listed the same way.
- [ ] CC7 — *diff* — `set -o pipefail; cd app && npm run gate` exits 0, and `method/check-closeout.mjs` (including its tests) passes against the branch.
- [ ] CC8 — *world-state* — The CI check from CC4 runs on the task's PR and is green; the owning role records, dated under this criterion, the PR check result (e.g. `gh pr checks` output). QA re-runs it.

**Not in scope**
- T5's CI check that a PR's branch names a work item present in `backlog.md`.
- Merge-rule edits (T2).
- Backlog-line lifecycle and the missing Draft status (a coming PO task).
- The relation between task and story ADRs.
- Acting on any fired trigger (e.g. superseding ADR-0007): each becomes its own work item.
- Editing any frozen ADR to add or normalise a revisit line.

---

## Doing

_(empty)_

---

## Review

_(empty)_

---

## Done

### S7 — Move the project to the SDK the phone's Expo Go now speaks
**Status:** Done · demoed on Alex's phone 2026-09-30 · merged in [PR #4](https://github.com/acardona123/agentic-dev-team/pull/4) · [ADR-0013](../method/adr/0013-expo-sdk-follows-the-store-expo-go.md)
**Intent:** "I want the app to open on my phone again, now that Expo Go on it has moved to SDK 57."

*Why this story exists (decided by Alex, 2026-09-30):* the Play Store auto-updated
Expo Go on his phone to SDK 57, and opening the project now shows "Project is
incompatible with this version of Expo Go — The installed version of Expo Go is for
SDK 57. The project you opened uses SDK 54." The principle of
[ADR-0007](../method/adr/0007-expo-sdk-pinned-to-expo-go.md) still holds (the SDK is
whatever Expo Go on the phone speaks); its premise (the Play Store build is capped at
54) has been falsified, so the architect must supersede it. Alex decided to move the
project up to the phone's SDK. **Rejected alternative:** sideloading an SDK 54 Expo Go
APK, already rejected in ADR-0007 as a manual step in the loop, and fragile because
the Play Store would re-update it. **Sequencing:** this goes before S2, because S2
adds location support whose version is SDK-bound, and doing S2 on 54 would mean
upgrading twice. Story IDs are identifiers, not order; S7 runs first.

**Acceptance criteria**
- [x] AC1 — Given Expo Go installed from the Play Store on Alex's phone and the dev server running via `npx expo start --tunnel`, when he scans the QR code, then the app opens with no "incompatible with this version of Expo Go" message.
- [x] AC2 — Given the app has opened, when Alex repeats the S1 flow (type an address, submit, see results with the "© OpenStreetMap contributors" line, tap one, see it shown as the selected target; also a no-match query and a no-network submit), then each behaves exactly as at the S1 demo, with no visible regression.
- [x] AC3 — Given the dev server is running, when the desk check from ADR-0007's "How to verify" section is run (the `curl` of the manifest's `runtimeVersion`), then it reports the SDK number that the phone's Expo Go names in its own compatibility message or About screen (57 at the time of writing), and `npx expo-doctor` and `npx expo install --check` report no problems.
- [x] AC4 — Given the project, when `set -o pipefail; cd app && npm run gate` is run, then it exits 0 (typecheck, tests and lint, per ADR-0011), with no test deleted or weakened to get there.
- [x] AC5 — Given `method/adr/`, when it is read, then a new ADR marks ADR-0007 as superseded and states the new premise and the new pinned SDK, and the "How to verify" expectation is updated so it no longer hard-codes `exposdk:54.0.0`.

**Not in scope**
- Fixing any item in Spotted, including the search-field staleness (S2 handles it) and the double-tap request.
- Any feature work or visible UI change.
- Leaving Expo Go for a development build.
- Dependency additions beyond what the upgrade itself requires.
- Re-triaging the "18 advisories accepted" Spotted item (see below).

**Follow-up flagged, not done here:** that Spotted item was accepted because ADR-0007
pinned SDK 54, and its "Re-open when" condition assumed a store build. After this
upgrade, re-check the advisory list against the new SDK. *(Closeout 2026-09-30:
"Alex or a later triage" was wrong — no role owns triage, which is the method gap
this story exposed. Re-triage is assigned to the architect; see Spotted.)*

**Demo:** Alex opens Expo Go (SDK 57) on his phone, scans the QR code, and the app
opens instead of the incompatibility error. He searches an address, picks a result,
and sees the same behaviour as at the S1 demo.

**What it cost, and why that was the point:** the upgrade itself was routine —
three SDK steps, gate green at each, no app source touched, QA found no defect.
What it exposed was in the method. Work that is not a phone-demoable story has
nowhere to live: the advisory re-triage was correctly out of scope here and had
no other home, so every participant deferred it to Alex. See
[method/log/S7.md](../method/log/S7.md).

---

### S1 — Address search
**Status:** Done · demoed on Alex's phone 2026-08-25 · merged in [PR #2](https://github.com/acardona123/agentic-dev-team/pull/2)
**Intent:** "I want to type an address, see matching results, pick one, and have the app hold on to its coordinates."

**Acceptance criteria**
- [x] AC1 — Given the app is open, when Alex types an address (e.g. "10 Downing Street London") and submits it, then a list of matching results is shown on screen, each with a human-readable label, and the text "© OpenStreetMap contributors" is visible on the same screen (geocoding provider and its licensing obligation: [ADR-0009](../method/adr/0009-geocoding-via-nominatim.md))
- [x] AC2 — Given a list of results is shown, when Alex taps one, then the list closes and the app shows the chosen address's label on screen, confirming it is now the selected target
- [x] AC3 — Given Alex types but does not submit, when he changes characters, then no request is fired per keystroke — a request is only made on an explicit submit action (e.g. tapping search / pressing done). Given Alex submits the exact same query text a second time without changing it, when he submits, then no new network request is made and the previous results are shown again. (Both are usage-policy obligations, not a performance nicety — see [ADR-0009](../method/adr/0009-geocoding-via-nominatim.md).)
- [x] AC4 — Given Alex submits a query that matches nothing, when the response comes back, then the app shows a plain "no results found" message instead of an empty or broken list
- [x] AC5 — Given Alex submits a query while the phone has no network, or the geocoding service responds with a rate-limit or server error, when the request fails, then the app shows the same plain error message instead of crashing or hanging silently
- [x] AC6 — Given the module that builds the geocoding request and turns its response into "candidate" objects (label + lat/lon), when it is unit tested in `app/src/lib/`, then tests verify: the outgoing request carries an identifying `User-Agent` header rather than a library default, a successful response maps to a list of candidates, and an empty response maps to no candidates — with no React or Expo imports in that module
- [x] AC7 — Given the project, when `npm run typecheck && npm test && npm run lint` is run, then all three pass

**Not in scope**
- Distance or bearing calculation to the selected address
- Live/streaming location, GPS, or any position tracking
- A map view
- Alarm arming, radius selection, or alarm firing
- Persisting the selected address across an app restart — holding it in in-memory state for the current session is enough
- Debouncing/throttling logic beyond "don't fire on every keystroke" (no autocomplete-as-you-type)
- Styling polish beyond legible, usable text and tappable rows

**Demo:** Alex opens the app, types a real address into a text field, taps
search, sees a list of matching places appear with the OpenStreetMap
attribution line beneath them, taps one, and sees the screen now display the
address he picked as the held selection.

*Why this shape: the riskiest assumption isn't in these ACs at all — it's
whether Nominatim's literal, structured matching ("10 Downing Street London")
is good enough for the addresses Alex actually types on a bus. It is not a
fuzzy intent matcher ([ADR-0009](../method/adr/0009-geocoding-via-nominatim.md)).
We find that out from real use after this story ships, not by building smarter
matching in advance.*

**What it cost, and why that was the point:** QA failed the first pass on AC3 and
was right to. Every outcome was cached, errors included, so a search that failed
in a tunnel could never be retried for the rest of the session — the app told the
user to try again and had already made trying again a no-op. It typechecked, it
passed 21 tests, CI was green: an error path that fails *politely* is invisible to
the machine gate by construction. The fix moved the rule into a pure module where
`CachedOutcome = Exclude<SearchOutcome, {kind:'error'}>` makes "never cache a
failure" a compile-time fact rather than a convention.

The more expensive defect was in the method, not the app. The dispatching session
proposed the phone demo *before* QA had reviewed — an ordering already fixed in
three places, none of which it had read. That produced `CLAUDE.md` rule 9, a
widened rule 8, a reordered Human gate, and
[ADR-0010](../method/adr/0010-no-orchestrator-agent.md). See
[method/log/S1.md](../method/log/S1.md).

---

### S0 — Walking skeleton on the phone
**Status:** Done · demoed on Alex's phone 2026-08-25 · merged in [PR #1](https://github.com/acardona123/agentic-dev-team/pull/1)
**Intent:** "I want to see a blank app running on my own phone before we build anything."

**Acceptance criteria**
- [x] AC1 — Given an empty repo, when the app is created, then `app/` holds an Expo + TypeScript project with strict mode on
- [x] AC2 — Given the dev server is started with `npx expo start --tunnel`, when Alex scans the QR code with Expo Go on his Android phone, then a screen showing "Almost There" appears on the phone
- [x] AC3 — Given the project, when `npm run typecheck && npm test && npm run lint` is run, then all three pass (a placeholder test is fine)
- [x] AC4 — Given a code change to the visible text, when it is saved, then the phone updates without a manual restart

**Not in scope**
- Any location, map, address or alarm code whatsoever
- Navigation, multiple screens, styling beyond legible text

**Demo:** Alex opens Expo Go, scans the QR, sees the text. Someone edits the
text, he watches it change on the phone.

*Why this is first: the riskiest link in the chain is WSL2 reaching your phone.
We prove it in an hour instead of discovering it after three days of features.*

**What it cost, and why that was the point:** two blocking defects surfaced that had
nothing to do with the feature and everything to do with the toolchain —
Expo Go on the phone is SDK 54 while the scaffold defaulted to SDK 57 ([ADR-0007](../method/adr/0007-expo-sdk-pinned-to-expo-go.md)),
and the repo sat on `/mnt/c`, where 9p delivers no inotify events, so Metro never
saw a save and Fast Refresh never fired ([ADR-0008](../method/adr/0008-repo-lives-on-wsl-ext4.md)).
Both would have been attributed to feature code had they first appeared during S1.

---

## Spotted
_Things agents noticed but were not allowed to fix. The session routes each entry to its owning role; the role returns a verdict; Alex confirms it._

- ~~`npm install` on Expo SDK 54 reports 18 advisories (9 moderate, 9 high).~~
  **Triaged 2026-08-25 — accepted, no action.** All 18 are transitive through the
  SDK's own tree, and 16 report `fixAvailable` only by upgrading `expo` itself,
  which [ADR-0007](../method/adr/0007-expo-sdk-pinned-to-expo-go.md) forbids: the
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
- ~~`.gitignore` now exists at both the repo root and in `app/`, with overlapping rules.
  Harmless, but worth collapsing to one file at some point.~~
  **Triaged 2026-08-25 — resolved, not as proposed (`b573729`).** The suggestion to
  collapse to one file was wrong: `app/.gitignore`'s `/ios` and `/android` are
  anchored to the directory holding the file. Hoisted to the repo root, those same
  patterns would match root-level `/ios` and `/android` only, and would silently
  stop matching `app/ios` and `app/android` — the generated native folders they
  exist to exclude — with no error, just the folders quietly becoming tracked at
  the next prebuild. Keeping two files also means `app/.gitignore` stays exactly
  as the Expo template ships it, so an SDK upgrade diffs cleanly instead of
  fighting our hand-edits ([ADR-0007](../method/adr/0007-expo-sdk-pinned-to-expo-go.md)).
  What was done instead: the root file was reduced to repo-wide, unanchored
  patterns only (`node_modules/`, `*.log`, `.DS_Store`), with `.expo/` and `dist/`
  dropped as already-covered app concerns, and a comment noting `app/.gitignore`
  is off-limits. Verified `app/node_modules`, `app/.expo`, `app/dist`, `app/ios`,
  `app/android`, `*.log`, `.DS_Store` and `method/node_modules` all still resolve
  as ignored, and nothing was mis-tracked.

- `src/lib/` is kept React/Expo-free by convention only — nothing in the lint config
  enforces it, so the first stray `import { Platform } from 'react-native'` in a lib
  module will pass the gate. An ESLint `no-restricted-imports` override scoped to
  `src/lib/**` would make CLAUDE.md's code-style rule machine-checked. Out of S1's scope.
- There is no test that renders `App.tsx`, so AC1–AC5 are verified by eye on the phone
  only. `jest-expo` ships with `react-test-renderer` available; a component test would
  let the "no request on keystroke / no re-request for an unchanged query" rule (AC3,
  ADR-0009 obligation 3) be caught by the gate instead of by inspection. Needs a story
  and a decision on whether we take on `@testing-library/react-native` under the SDK
  pin ([ADR-0013](../method/adr/0013-expo-sdk-follows-the-store-expo-go.md); was 54, now 57).
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
  attribution on screen ([ADR-0009](../method/adr/0009-geocoding-via-nominatim.md)
  obligation 4) depends on one property, not two.
- Double-tapping Search can fire two requests. The `if (searching …) return` guard
  (`App.tsx:41`) reads a state value rather than a ref, so two taps landing inside
  one commit both observe `searching === false` and both dispatch. Low probability,
  but it lands on Nominatim's rate policy
  ([ADR-0009](../method/adr/0009-geocoding-via-nominatim.md) obligation 2), not
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

  Both contradict [ADR-0006](../method/adr/0006-test-and-lint-toolchain.md), which
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
     ([ADR-0012](../method/adr/0012-ci-check-for-story-closeout-artifacts.md)).
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
     [ADR-0004](../method/adr/0004-git-flow-branching.md), `CLAUDE.md` and the DoD,
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
     [ADR-0006](../method/adr/0006-test-and-lint-toolchain.md), and the session's
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
     slip foreseen by [ADR-0010](../method/adr/0010-no-orchestrator-agent.md)'s
     "Revisit" has happened (S7, rule 8 — point 5's correction), so by its own
     condition a mechanical fix is due. Candidates, each tied to an observed
     failure: block agent commits/pushes on `develop`/`main`; make QA truly
     read-only; CI checks each PR names a work item present in `backlog.md`;
     branch protection on GitHub (Alex's action); `closeout.md` as a `/closeout`
     skill; a slimmer `CLAUDE.md`. Packaging the method as a plugin: decide "not
     now, at porting time" ([PORTING.md](../method/PORTING.md)). Becomes T1's ADR,
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
  (2026-10-07):** [ADR-0015](../method/adr/0015-adr-lifecycle.md) as drafted,
  taking number 0015 (T1's ADR takes the next free one); the PO's backlog
  writes land on the item's own branch from its first commit
  ([ADR-0014 §6](../method/adr/0014-work-item-types.md#6-only-a-merged-pr-reaches-develop));
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
  2026-10-08): T1's CC8 "(including its tests)" passed vacuously. T5 extends the
  script, so its completion criteria should require tests for it.
- ~~**Agents merging and pushing `main` vs `CLAUDE.md`** (QA, 2026-10-07; predates
  the "Method gap" work item).~~ **Triaged 2026-10-08 — becomes part of T2 (Alex's
  decision).** Merging a PR is Alex's only, never an agent's, even on instruction,
  so the DoD's "or by an agent on Alex's explicit instruction" clauses go. The
  non-PR git operations of the closeout — fast-forwarding `main` and pushing it —
  an agent may run on Alex's explicit, one-shot consent given at that moment;
  `CLAUDE.md`'s wording is nuanced accordingly. Original finding: `CLAUDE.md` `## Git workflow` says "Agents never
  push to `main` or `develop`, and never merge a PR", but the
  [DoD](../method/definition-of-done.md) Human gate lets an agent merge on Alex's
  explicit instruction for that specific PR (the S1 exception, now extended to
  the closeout PR and task PRs), and [closeout.md](../method/closeout.md) Beat 2
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
  2026-10-07).~~ **Triaged 2026-10-08 — becomes task T8.** Original finding: [ADR-0014 §6](../method/adr/0014-work-item-types.md#6-only-a-merged-pr-reaches-develop)
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
  *inside* a story, while [ADR-0014](../method/adr/0014-work-item-types.md) §1's
  table classes "an ADR" as a task. Nothing says which wins, which precedes which,
  or what happens when a technical decision arises mid-story. Until now technology
  choices were made within stories. S2 is blocked on exactly this case (its ADR on
  how the app obtains position). **To be settled before S2.** Raised during the T7
  ordering; deliberately not acted on now — focus stays on the Method gap work.
