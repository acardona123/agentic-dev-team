# 0013 — The Expo SDK follows the store's Expo Go, and the store moves it
**Status:** Accepted · **Date:** 2026-09-30 · **Supersedes** [0007](0007-expo-sdk-pinned-to-expo-go.md)  
**Scope:** project — about Expo Go and this phone; another stack has no such coupling.

## Context
ADR-0007 pinned SDK 54 on the premise that the Play Store's Expo Go on Alex's
phone was **capped** at 54. On 2026-09-30 the Play Store auto-updated it, and the
project stopped opening: *"The installed version of Expo Go is for SDK 57. The
project you opened uses SDK 54."* (story S7). The premise was false.

What it actually was, checked 2026-09-30 against Expo's own pages:

- `docs.expo.dev/versions/latest/`: latest is **SDK 57.0.0** (RN 0.86, React 19.2.3).
- `expo.dev/go`: Expo Go's SDK is listed as "SDK 57 (latest)".
- `docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/`: Expo Go "only supports
  the latest SDK version and previous versions are no longer supported"; upgrade
  "incrementally, one at a time".
- `expo.dev/changelog/sdk-55` and `/sdk-56`: the Expo Go builds for **SDK 55 and 56
  were never published to Google Play or the App Store** (CLI/TestFlight only).
  `/sdk-57`: 57 is intended as a non-breaking step from 56.

So the phone was never capped. The store just skipped 55 and 56, which made the
last store build look like a ceiling. The next store publish moved it three SDKs
at once, with no warning, overnight.

## Decision
**The principle of 0007 stands unchanged:** the SDK is whatever the Expo Go binary
on the phone speaks. The rules in 0007's "constraint" block still apply word for
word (`npx expo install <pkg>`, never `@latest`, never a version from newer docs,
re-check with `npx expo install --check`).

**What replaces the premise:** the Play Store build *is* the client, and the store
moves it on its own schedule. The SDK is therefore pinned **for now**, not forever.
We follow the store; we do not hold it back.

Pinned now: **SDK 57** (`expo ~57.0.26`), everything else resolved by Expo's
installer: react-native 0.86.3, react 19.2.3, @types/react ~19.2.10,
expo-status-bar ~57.0.1, jest-expo ~57.0.5, eslint-config-expo ~57.0.2,
typescript ~6.0.3. `expo` is on `~`, not `^`, because a caret lets a lockfile-free
install float to the next SDK, silently breaking the principle.

### The signal, and the response next time
**Signal:** Expo Go on the phone shows "Project is incompatible with this version of
Expo Go", naming a newer SDK. It arrives unannounced: the store updates Expo Go
without asking. Treat it as a story (like S7), not a hotfix. The app on `main` is
not broken, the client moved.

**Response:** step one SDK at a time, gate at each step, commit each step:

    npx expo install expo@^<N>.0.0 --fix     # then: npm run gate; npx expo-doctor

then pin `expo` back to `~<resolved>` with `npx expo install expo@~<resolved>`.
Read each `expo.dev/changelog/sdk-<N>` for app.json keys that were removed.

**Known snag, seen in S7 (56→57):** `--fix` runs two `npm install`s (dependencies,
then devDependencies). When a devDependency (`jest-expo`) takes a peer pinned to the
old React Native (`@react-native/jest-preset`), each install blocks the other with
`ERESOLVE`. Fix without guessing versions: copy the "expected version" list
`expo install --fix` prints into `package.json`, delete only the stale peer's entry
from `package-lock.json`, run one `npm install`, and confirm with
`npx expo install --check`. Never `--force` or `--legacy-peer-deps`.

## How to verify a change did not break this
Metro's manifest carries the SDK Expo Go matches against. With `expo start` running:

    curl -s -H "expo-platform: android" -H "accept: application/expo+json,application/json" \
      http://localhost:8081/ | grep -o '"runtimeVersion":"[^"]*"'

It must say `exposdk:<N>.0.0`, where **N is the SDK the phone's Expo Go names** in its
own incompatibility message or About screen (`exposdk:57.0.0` at the time of writing).
The phone is the reference, not this file. `npx expo-doctor` (21/21 on SDK 57) and
`npx expo install --check` ("Dependencies are up to date") catch drift more broadly.

## Fallout of 54→57 recorded here so no one re-derives it
- `app.json` gained `"plugins": ["expo-status-bar"]`, written by `expo install`. Since
  SDK 55, status-bar config lives in that plugin. Config plugins act only at native
  prebuild, so under Expo Go it is inert.
- SDK 55 removed the Legacy Architecture; SDK 56 moved TypeScript to 6.0. Neither
  needed a source change: gate green at 55, 56 and 57 with the same 31 tests.
- **Open runtime risk, closed only by the phone (S7 AC2):** from SDK 56, `expo/fetch`
  replaces React Native's as the global `fetch`, and `App.tsx` passes the global to
  `searchAddress`. ADR-0009 obligation 1 needs our `User-Agent` on the wire. The
  gate cannot see this, because the tests inject a double (that is the point of the
  seam). Expo's docs do not say whether `expo/fetch` forwards a custom `User-Agent`.
  If AC2 fails with a Nominatim block/403, the config-only response is
  `EXPO_PUBLIC_USE_RN_FETCH=1`, and it should be an ADR decision, not a quiet edit.

## Trade-off
- **Upgrades are now unscheduled work.** Each store publish can break the demo loop
  overnight and cost a story before any feature work. There is no way to be told in
  advance from WSL2. Accepted, because the alternative is sideloading, which S7
  already rejected.
- **Skipping SDKs is the likely case, not the edge.** Store publishes are irregular
  (55 and 56 never shipped to stores), so the next jump may be several SDKs, with
  intermediate steps that never run on a real phone. Only the final SDK gets a device
  check. Breakage specific to an intermediate SDK is invisible, and it is also irrelevant.
- **Version-bound work moves under our feet.** Any library story (location, audio,
  notifications) may need redoing after a jump. That is why S7 runs before S2.
- **Revisit when** a jump lands in the middle of a story, or a story needs an API
  Expo Go lacks. At that point a development build (0001's escape hatch) removes the
  store from the loop at the cost of a cloud build per native change.

## Alternatives rejected
- **Sideload an SDK 54 Expo Go APK.** A manual step in the demo loop, and the Play
  Store would re-update it. Rejected by Alex in S7, and already in 0007.
- **Turn off auto-update for Expo Go on the phone.** It buys time, but Expo Go
  supports only the latest SDK, so the pin decays anyway and a forced update later
  is a bigger jump. It also depends on phone state no agent can see.
- **Jump 54→57 in one `expo install`.** Fewer commits, but Expo's guide says one
  SDK at a time, and a failure would not say which SDK caused it.
- **Development build now.** Removes the coupling entirely, but costs a cloud build
  per native change and is 0001's call at the background-location story, not a side
  effect of a version bump.
