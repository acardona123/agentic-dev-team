# Backlog — Almost There

Single source of truth. A story moves: **Backlog → Ready → Doing → Review → Done**.
Only Alex moves a story to **Done**, and only after seeing it work on his phone.

---

## Ready

_(empty)_

---

## Backlog (not yet refined — the PO turns these into stories, one at a time)

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
_Things agents noticed but were not allowed to fix. Triage these yourself._

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
  4. *GitHub Issues* — the repo stays the **only** source of truth (Alex: absolute).
     Issues would be a progress view and PR↔work-item links, and would let CI check
     "every PR references a work item". The real problem is keeping them in sync
     with the repo, and the method that writes and syncs them; also its portability
     (it binds the method to GitHub).
  5. *Kickoff decisions* — merge strategy is a per-project choice made at project
     start; the architect should guide a new project through such choices. For this
     project Alex chose **merge commits** (`--merge`): what QA and CI judged is what
     lands, per-step commits stay bisectable, `--first-parent` still gives one line
     per story. Needs a core ADR (kickoff decisions) and a project ADR (the choice).
