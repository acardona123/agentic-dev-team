# 0001 — Expo (React Native) + TypeScript for the mobile app
**Status:** Accepted · **Date:** 2026-08-24  
**Scope:** project — The app is a pretext; another project picks its own stack.

## Context
The app must run on Alex's Android phone. The dev machine is WSL2 with Node 22,
no Java, no Android SDK, no Flutter. Alex is a C/C++ dev learning to manage AI
development, so time spent on toolchain setup is time not spent on the goal.

## Decision
Expo (React Native) with TypeScript, run on the phone through the Expo Go app.
Dev server served over `npx expo start --tunnel`.

## Trade-off
Expo Go cannot run arbitrary native modules, so the eventual background-location
alarm will require a development build (Expo cloud build — no Mac needed for
Android, but a slower loop). We accept that cost because milestone 1 is
foreground-only and Expo Go gives a sub-minute edit→phone feedback loop today.

Revisit when a story needs a native module Expo Go doesn't bundle — background
geofencing is the expected trigger.

## Alternatives rejected
- **Native Android / Kotlin** — needs JDK + Android SDK + emulator in WSL2. Days of setup, and the emulator's GPS story is worse than a real phone's.
- **Flutter** — not installed, and adds Dart on top of everything else Alex is learning.
- **PWA / plain web** — no reliable background location, no dependable alarm sound when the screen is off. Dead end for the real use case.

## Note on WSL2 networking
The phone cannot reach Metro on WSL2's NAT address. Order of fixes:
`--tunnel` first, then running Expo from Windows-side Node, then `netsh portproxy`.
Proving this works is story S0, before any feature code exists.
