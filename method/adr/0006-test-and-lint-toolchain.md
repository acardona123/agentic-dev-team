# 0006 — Test and lint toolchain for the Expo app
**Status:** Accepted · **Date:** 2026-08-24  
**Scope:** project — Another project brings its own typecheck/test/lint tools.

## Context
`method/definition-of-done.md` requires `npm run typecheck && npm test && npm run lint`
to pass, but `create-expo-app --template blank-typescript` ships none of the three
scripts and no test or lint tooling. S0 has to choose them once so no later story
re-derives it.

## Decision
- **typecheck** — `tsc --noEmit` against `expo/tsconfig.base` with `"strict": true`
  and `"types": ["jest"]`. The explicit `types` entry is needed because the base
  config does not pull in ambient test globals, so `describe`/`it` would otherwise
  be type errors in `src/lib/*.test.ts`.
- **test** — `jest` with the `jest-expo` preset. It is the preset Expo maintains for
  its own SDK version, so it handles the RN transform without a hand-written babel
  config. `--passWithNoTests` keeps the gate honest-green on a story that adds no test.
- **lint** — `eslint` 9 flat config extending `eslint-config-expo/flat`. No custom
  rules yet; any added rule gets justified in the story that needs it.
- **tunnel** — `@expo/ngrok` is a **devDependency**, not a global install. Without it
  `npx expo start --tunnel` stops and asks to install globally, which fails in a
  non-interactive shell and makes the one command that reaches the phone unreliable.

## Trade-off
Four dev dependencies on a project whose rule is a short dependency list. All four
exist solely to satisfy an existing gate; three of them are Expo's own packages and
move with the SDK version.

## Consequence
The command that puts the app on the phone is, from `app/`:

    npx expo start --tunnel

## Note on WSL2
`expo start` prints an error that React Native DevTools cannot launch
(`libasound.so.2` missing — no audio libs in this WSL2 image). Metro and the tunnel
come up regardless; it only disables the desktop debugger UI.
