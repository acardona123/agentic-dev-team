# Manager playbook

Your cheat sheet. You are the manager. You never write app code.

## The loop, per story

```
1. YOU     one sentence of intent
2. po      drafts the story + acceptance criteria
3. YOU     approve or sharpen the AC                    ← YOUR GATE
4. architect  (only if a new tech decision is needed)
5. dev     implements exactly that story, gate green
6. qa      reviews cold, read-only, PASS/FAIL per AC
7. YOU     run the demo on your phone → Done, or back to 5  ← YOUR GATE
```

Steps 3 and 7 are the job. Everything else is delegation.

## What to literally type

| Step | Say this |
|---|---|
| 2 | `Use the po agent: I want to <one sentence>.` |
| 4 | `Use the architect agent to decide <question> for story S<n>.` |
| 5 | `Use the dev agent to implement S<n>.` |
| 6 | `Use the qa agent to review S<n>.` |
| 7 | `gh pr merge --squash` — after you've seen it on the phone |

## Git, per story

```bash
git switch develop && git pull
git switch -c story/S2-live-position          # dev agent works here
# ... dev implements, commits as "S2: ...", opens the PR against develop
gh pr comment --body-file qa-report.md        # qa's verdict, permanently on the diff
gh pr merge --squash --delete-branch          # into develop: "the machine believes it"

# then YOU demo on the phone. Only after that:
git switch main && git merge --ff-only develop && git push
```

That last line is the one that matters. `main` means *you have held this in your
hand*. If you ever find yourself merging it without a demo, the branch has
stopped meaning anything and you should collapse back to trunk-based.

The PR is where the review becomes permanent. A QA verdict in a terminal
scrolls away; a QA verdict on a diff is still there in six months when you're
writing this project up.

## Sharpening acceptance criteria — the highest-leverage skill

When the PO hands you a story, attack it with these:

- **"How would someone who didn't build it check this?"** If the answer is "read
  the code", the AC is wrong.
- **"What's the ugly input?"** Empty address, no GPS signal, permission denied,
  target 2 km away, target 5 m away.
- **"What would I hate to discover in a bus?"** That's usually the missing AC.
- **"Is this two stories?"** Almost always yes early on.

## Reading a QA report

- All PASS → run the demo yourself anyway. QA can't hold your phone.
- Any FAIL → back to dev with the QA report, don't re-specify from scratch.
- UNVERIFIABLE HERE → that's yours to test. This is the honest answer, not a dodge.
- QA found out-of-scope changes → make dev remove them. This one matters more
  than it looks: uncontrolled scope is what makes AI output impossible to review.

## Before you start a story

- `/clear` if the session covered a different story. See [token-budget.md](token-budget.md).
- Have the story open. Point agents at files by path; never ask them to go looking.
- Plan to finish in one sitting — cheaper, and it keeps the story small.

## Smells that mean you're managing badly

| Smell | What it means | Fix |
|---|---|---|
| You're reading every line of the diff | Stories are too big | Split harder |
| QA always passes everything | AC are too vague to fail | Add ugly-input AC |
| You're editing code yourself | The loop broke upstream | Write the story you actually wanted |
| "It works" but you haven't seen it | You trusted a claim | Demo, every time |
| You merged because CI was green | CI proves it runs, not that it's right | Demo, every time |
| `main` is 3+ stories behind `develop` | "main = demoed" has become a fiction | Demo or drop the branch |
| Session has covered two stories | Quadratic token cost | `/clear`, the repo holds the state |
| Agent asks you a design question mid-implementation | Story was ambiguous | Answer, then fix the AC |

## What transfers to your real job

The stack is disposable. These are not:
1. A spec exists before code, and it's testable.
2. Slices are small enough to review in one sitting.
3. The reviewer is not the author.
4. A machine gate runs before human attention is spent.
5. Decisions are written down where the next session will find them.
6. The scope of a change is bounded and visible before anyone reviews it.
7. State lives in the repo, not in a conversation — so context is disposable.
