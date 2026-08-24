# 0007 — The Expo SDK version is dictated by the Expo Go build on Alex's phone
**Status:** Accepted · **Date:** 2026-08-25 · **Supersedes the version choice in** 0001

## Context
S0 was first scaffolded with `create-expo-app` defaults, which means "latest" —
SDK 57 (RN 0.86, React 19.2). It failed on the phone: Expo Go from the Play Store
on Alex's Android device is 54.0.8, and **Expo Go supports exactly one SDK version**.
It refused the project outright with "This project requires a newer version of Expo Go".
His Play Store build appears to be capped at 54, so the client cannot be moved up.

## Decision
Pin the project to **Expo SDK 54** (`expo ~54.0.37`) and treat the SDK version as an
input we do not control, not a thing we choose.

**The constraint, stated once so no future session re-derives it:**
> The SDK version is whatever the Expo Go binary on the phone speaks. Never run
> `npx expo install <pkg>@latest`, never accept a `create-expo-app` default, and
> never take a dependency version from documentation written for a newer SDK.
> Add packages with `npx expo install <pkg>` — it resolves the version matching the
> SDK in `package.json` — and re-check with `npx expo install --check`.

Current pins, all resolved by `npx expo install --fix` from `expo ~54.0.37` rather
than guessed: react-native 0.81.5, react 19.1.0, @types/react ~19.1.10,
expo-status-bar ~3.0.9, jest-expo ~54.0.18, eslint-config-expo ~10.0.0,
typescript ~5.9.2.

`app.json` also lost `android.predictiveBackGestureEnabled`, an SDK 57-only key.

## Consequence for S1 onward
Every library story (Nominatim client, `expo-location`, `expo-av`/`expo-audio`,
notifications) is version-constrained by SDK 54. If a story needs an API that only
exists in a later SDK, the choice is: do without, or leave Expo Go for a development
build (the escape hatch ADR 0001 already anticipates for background geofencing).
That is a deliberate decision with an ADR, not something a dependency bump does quietly.

## How to verify a change did not break this
Metro's manifest carries the SDK Expo Go matches against. With `expo start` running:

    curl -s -H "expo-platform: android" -H "accept: application/expo+json,application/json" \
      http://localhost:8081/ | grep -o '"runtimeVersion":"[^"]*"'

It must say `exposdk:54.0.0`. `npx expo-doctor` (18/18) catches version drift more broadly.

## Alternatives rejected
- **Upgrade Expo Go on the phone** — not available to him; the Play Store build is the
  build. Sideloading a newer APK adds a manual step to the loop S0 exists to prove.
- **Development build instead of Expo Go** — removes the SDK ceiling, but costs a cloud
  build per native change and AC2 names Expo Go explicitly. Revisit at the background
  location story, per ADR 0001.
