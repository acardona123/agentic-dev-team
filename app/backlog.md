# Backlog — Almost There

Single source of truth. A story moves: **Backlog → Ready → Doing → Review → Done**.
Only Alex moves a story to **Done**, and only after seeing it work on his phone.

---

## Ready

_(empty)_

---

## Backlog (not yet refined — the PO turns these into stories, one at a time)

- **S2 — Live position.** Ask location permission, stream position, show live distance to the target.
- **S3 — Arm/disarm + radius.** Choose 200/500/1000 m, arm the alarm, armed state is unmistakable.
- **S4 — Alarm fires.** Inside the radius → sound + vibration + unmissable screen + dismiss.
- **S5 — Desk test harness.** Feed fake positions so the alarm can be tested without riding a bus.

> S5 looks like a detour and is the most valuable item here. If you can't test it
> from your desk, you can't manage it. Expect to want it around S2 — pulling it
> forward then is the right call, not a failure of planning.

---

## Doing

_(empty)_

---

## Review

### S1 — Address search
**Status:** Review · gate green on `story/S1-address-search` · not yet demoed on a phone
**Intent:** "I want to type an address, see matching results, pick one, and have the app hold on to its coordinates."

**Acceptance criteria**
- [ ] AC1 — Given the app is open, when Alex types an address (e.g. "10 Downing Street London") and submits it, then a list of matching results is shown on screen, each with a human-readable label, and the text "© OpenStreetMap contributors" is visible on the same screen (geocoding provider and its licensing obligation: [ADR-0009](../method/adr/0009-geocoding-via-nominatim.md))
- [ ] AC2 — Given a list of results is shown, when Alex taps one, then the list closes and the app shows the chosen address's label on screen, confirming it is now the selected target
- [ ] AC3 — Given Alex types but does not submit, when he changes characters, then no request is fired per keystroke — a request is only made on an explicit submit action (e.g. tapping search / pressing done). Given Alex submits the exact same query text a second time without changing it, when he submits, then no new network request is made and the previous results are shown again. (Both are usage-policy obligations, not a performance nicety — see [ADR-0009](../method/adr/0009-geocoding-via-nominatim.md).)
- [ ] AC4 — Given Alex submits a query that matches nothing, when the response comes back, then the app shows a plain "no results found" message instead of an empty or broken list
- [ ] AC5 — Given Alex submits a query while the phone has no network, or the geocoding service responds with a rate-limit or server error, when the request fails, then the app shows the same plain error message instead of crashing or hanging silently
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

---

## Done

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
  and a decision on whether we take on `@testing-library/react-native` under the SDK 54
  pin ([ADR-0007](../method/adr/0007-expo-sdk-pinned-to-expo-go.md)).
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
  old text. AC2 is satisfied as written ("tap a shown result → it becomes the
  target"), so this was out of S1's scope. S2 touches this screen and is the
  natural place to deal with it.
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
