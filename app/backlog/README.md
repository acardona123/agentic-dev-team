# Backlog — Almost There

Single source of truth, as a directory ([ADR-0018](../../method/adr/0018-backlog-one-file-per-item.md)).
A work item's `**Status:**` moves **Draft → Ready → Doing → Review → Done**; Alex's
`<ID>: approved Ready` commit alone moves it to Ready, and an amendment sets it back
to Draft. Only Alex moves a work item to **Done** — a story only after seeing it work
on his phone, a task after reading its deliverable
([ADR-0014](../../method/adr/0014-work-item-types.md)).

Layout: this file (the order and the recipes), `spotted.md` (open Spotted entries),
`<ID>.md` (one per item not Done), `archive/<ID>.md` (Done items), `archive/spotted.md`
(closed entries).

**Read the live work** (the order, every item not Done, the open Spotted entries):

    cat app/backlog/*.md

With the Read tool: Glob `app/backlog/*.md`, then Read every file it returns,
whole. **The item in progress** is `app/backlog/<ID>.md`, its ID taken from the
branch name; dev and QA read that file, not the recipe.

**Read the archive**, for anything that cites a Done item or a closed entry:

    cat app/backlog/archive/*.md

A citation reaches its target by ID, as the path `app/backlog/archive/<ID>.md`,
or by an entry's title, found with `grep -n "<title>" app/backlog/archive/spotted.md`.

## Backlog (every item not Done, in priority order — top is next; the PO owns this order. An entry stays until its item is Done; it may be a one-line item not yet drafted)

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
  [ADR-0009](../../method/adr/0009-geocoding-via-nominatim.md) was for geocoding.
  Then the PO writes S2 from the same one-sentence intent: *"I want to see how
  far I am from the address I picked, updating as I move."*
- **S3 — Arm/disarm + radius.** Choose 200/500/1000 m, arm the alarm, armed state is unmistakable.
- **S4 — Alarm fires.** Inside the radius → sound + vibration + unmissable screen + dismiss.
- **S5 — Desk test harness.** Feed fake positions so the alarm can be tested without riding a bus.
- **S6 — Recent searches.** Show previously found addresses as you type, so a
  repeated journey is one tap instead of retyping. Raised by Alex after the S1
  demo. **Note for whoever refines this:** offering *local* history on keystroke
  is **not** a breach of [ADR-0009](../../method/adr/0009-geocoding-via-nominatim.md)
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

- **Revisit ADR-0011** — trigger "a third `pipefail` slip recorded in a log; escalate to a checked-in `method/gate.sh`" fired (QA on T7, 2026-10-08): `method/log/S7.md:40-43` logs the architect running an install through `| tail` without `pipefail`, the third after S0's log and ADR-0011's own Context (an install, not the gate). Owner: architect. Confirmed by Alex, 2026-10-08.
- **T9 — Resuming after a break, from the repo alone.** A QA verdict
  lives only in the conversation: after a pause, a READY FOR ALEX
  given before the Done commit is lost and QA must be re-run
  (observed in T7's closeout, 2026-10-08). Persist each verdict where
  a later session can read it (e.g. a PR comment), and write the
  resume procedure as `method/resume.md`, read on demand like
  `closeout.md` — prose per ADR-0016 §2, a skill only after an
  observed failure as in §3(e). When it lands, Alex deletes his interim personal command
  `~/.claude/commands/reprise.md`, which checks for this file and
  says so itself. Owner: architect, then `qa.md` and
  `closeout.md`. Raised by the session, accepted by Alex, 2026-10-08.

