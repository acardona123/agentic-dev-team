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
  fighting our hand-edits ([ADR-0007](../../../method/adr/0007-expo-sdk-pinned-to-expo-go.md)).
  What was done instead: the root file was reduced to repo-wide, unanchored
  patterns only (`node_modules/`, `*.log`, `.DS_Store`), with `.expo/` and `dist/`
  dropped as already-covered app concerns, and a comment noting `app/.gitignore`
  is off-limits. Verified `app/node_modules`, `app/.expo`, `app/dist`, `app/ios`,
  `app/android`, `*.log`, `.DS_Store` and `method/node_modules` all still resolve
  as ignored, and nothing was mis-tracked.
