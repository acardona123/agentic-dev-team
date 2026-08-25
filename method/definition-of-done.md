# Definition of Done

A story is Done when **every** line below is true. No partial credit — "Done
except..." means Doing.

## Machine gate (CI enforces this; dev runs it locally first)
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] Pure logic in `app/src/lib/` has unit tests covering the happy path and at
      least one edge case
- [ ] The PR's CI check is green — this, not the dev agent's report, is the
      authority

## Review gate (QA, read-only)
- [ ] Every acceptance criterion has a verdict: PASS / FAIL / UNVERIFIABLE HERE
- [ ] No changes in the diff that aren't traceable to an AC in this story
- [ ] Anything QA couldn't verify is written up as steps for Alex

## Human gate (Alex only)

**This list is a sequence, not a set.** The order below is the order it happens
in; `develop` is where stories integrate before a demo, so the merge comes
first ([ADR-0004](adr/0004-git-flow-branching.md)). Demoing a story branch
directly demos code that has never been integrated with anything else on
`develop` — harmless with one story in flight, wrong the moment two dev agents
run in parallel, which is the case `develop` exists for.

- [ ] Committed with the story ID in the message, e.g. `S2: live distance display`
- [ ] Any new technology decision has an ADR in `method/adr/`
- [ ] PR merged into `develop` by Alex (never by an agent)
- [ ] Ran the demo on a real Android phone and saw it work
- [ ] `main` fast-forwarded to `develop` — this is what "demoed" means in git
- [ ] `method/log/S<n>.md` written — especially the "method change" line

---

**A green CI badge is not a passing story.** CI proves the code runs; it says
nothing about whether it does the right thing. The phone demo stays mandatory,
and the temptation to skip it *because* the badge is green is the specific trap
to watch for.

**Why the machine gate comes first:** it's free and it never gets bored. Your
attention is the scarce resource — spend it on whether the thing is *right*,
not on whether it compiles. Coming from C/C++: this is `-Wall -Werror` plus a
test run, wired so nobody can skip it.
