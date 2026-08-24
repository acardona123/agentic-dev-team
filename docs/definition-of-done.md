# Definition of Done

A story is Done when **every** line below is true. No partial credit — "Done
except..." means Doing.

## Machine gate (dev proves this, QA re-runs it)
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] Pure logic in `app/src/lib/` has unit tests covering the happy path and at
      least one edge case

## Review gate (QA, read-only)
- [ ] Every acceptance criterion has a verdict: PASS / FAIL / UNVERIFIABLE HERE
- [ ] No changes in the diff that aren't traceable to an AC in this story
- [ ] Anything QA couldn't verify is written up as steps for Alex

## Human gate (Alex only)
- [ ] Ran the demo on a real Android phone and saw it work
- [ ] Any new technology decision has an ADR in `docs/adr/`
- [ ] Committed with the story ID in the message, e.g. `S2: live distance display`

---

**Why the machine gate comes first:** it's free and it never gets bored. Your
attention is the scarce resource — spend it on whether the thing is *right*,
not on whether it compiles. Coming from C/C++: this is `-Wall -Werror` plus a
test run, wired so nobody can skip it.
