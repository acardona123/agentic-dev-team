# Backlog — Almost There

Single source of truth. A story moves: **Backlog → Ready → Doing → Review → Done**.
Only Alex moves a story to **Done**, and only after seeing it work on his phone.

---

## Ready

_(empty)_

---

## Backlog (not yet refined — the PO turns these into stories, one at a time)

- **S1 — Address search.** Type an address, get results from Nominatim, pick one, coords held in state.
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

## Review

### S0 — Walking skeleton on the phone
**Status:** Review
**Intent:** "I want to see a blank app running on my own phone before we build anything."

**Acceptance criteria**
- [ ] AC1 — Given an empty repo, when the app is created, then `app/` holds an Expo + TypeScript project with strict mode on
- [ ] AC2 — Given the dev server is started with `npx expo start --tunnel`, when Alex scans the QR code with Expo Go on his Android phone, then a screen showing "Almost There" appears on the phone
- [ ] AC3 — Given the project, when `npm run typecheck && npm test && npm run lint` is run, then all three pass (a placeholder test is fine)
- [ ] AC4 — Given a code change to the visible text, when it is saved, then the phone updates without a manual restart

**Not in scope**
- Any location, map, address or alarm code whatsoever
- Navigation, multiple screens, styling beyond legible text

**Demo:** Alex opens Expo Go, scans the QR, sees the text. Someone edits the
text, he watches it change on the phone.

*Why this is first: the riskiest link in the chain is WSL2 reaching your phone.
We prove it in an hour instead of discovering it after three days of features.*

## Done

_(empty)_

---

## Spotted
_Things agents noticed but were not allowed to fix. Triage these yourself._

- `expo start` in WSL2 prints `ERROR ... react-native-devtools: libasound.so.2: cannot
  open shared object file`. Metro and the tunnel start fine; only the desktop debugger
  UI is unavailable. Fixable with `sudo apt install libasound2` or by ignoring it.
- `npm install` on the fresh Expo 57 template reports 10 moderate-severity advisories,
  all transitive. Not touched under S0 scope.
- `.gitignore` now exists at both the repo root and in `app/`, with overlapping rules.
  Harmless, but worth collapsing to one file at some point.
