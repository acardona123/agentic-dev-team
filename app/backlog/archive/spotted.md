## Spotted — closed
_Entries whose verdict is fully carried out, kept with their verdicts intact. Open entries live in `../spotted.md`._

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
- ~~**No status for a drafted, not-yet-approved work item** (session, T1 draft,
  2026-10-07).~~ **Triaged 2026-10-08 — becomes task T8.** Original finding: [ADR-0014 §6](../../../method/adr/0014-work-item-types.md#6-only-a-merged-pr-reaches-develop)
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
- ~~**Re-approval after an amendment is unwritten** (session, 2026-10-08).~~
  **Triaged 2026-11-05 — becomes part of task T8 (Alex's decision).** An amendment
  to an approved item sets its Status back to `Draft`; only Alex's `approved Ready`
  commit moves it to `Ready`, every time. Original finding: [ADR-0014](../../../method/adr/0014-work-item-types.md) §6 makes
  Alex's approval "the Status → Ready commit", but says nothing of an item amended
  after approval. In T7 the session had the PO set `Ready` inside both amendments
  (f8814e6, 80e582e), leaving Alex's `T7: approved Ready` commits empty (41078bb,
  acae7a1). The freeze point held; the record did not. Fix: an amendment leaves
  Status unchanged, and Alex's re-approval commit is the one that moves it to `Ready`.
