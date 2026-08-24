# Token budget

Ordered by actual impact. The first two matter more than everything below them
combined, and neither is about which model you pick.

## 1. Context length dominates cost — so reset between stories

Every turn re-sends the entire conversation. A session that has grown to 100k
tokens costs ~100k input tokens **per message**, whether you asked something
big or typed "ok". Cost over a session is roughly quadratic in how long you let
it run.

**Rule: one story per session. `/clear` between stories.**

This is what all the writing-things-down is *for*. `CLAUDE.md`, the backlog and
the ADRs mean a fresh session is fully productive in one message — the state
lives in the repo, not in the conversation. A method that needs a long
conversation to stay coherent is a method you cannot afford.

Signals you should have cleared already:
- You're on a different story than when the session started
- You're scrolling to remember what was decided
- The last three exchanges re-explained something written in `method/`

## 2. Subagents keep their own context — use them for anything exploratory

When the dev agent makes 40 tool calls, those file reads land in *its* context
and die with it. Your main session receives only the summary. The same work done
inline would leave all 40 file dumps in your conversation, and you'd re-pay for
them on every subsequent turn.

This is why the method is built from role agents rather than you asking one long
running assistant to do everything. The role separation is a quality argument
*and* a cost argument, and they happen to agree.

## 3. Push every error class you can into CI

GitHub Actions minutes are not Claude tokens. A type error caught by `tsc` costs
nothing; the same error caught by an agent costs a full review cycle, a rework
turn and another review.

**Never spend a model turn on something a machine catches for free.** Every
check you add to the gate permanently removes a class of error from your token
budget. This compounds — it's the only lever here that gets *cheaper* over time.

## 4. Match the model to the shape of the job

| Role | Model | Why |
|---|---|---|
| `po` | sonnet | Prose against a fixed template. Small input, small output. |
| `architect` | opus | Rare, high-stakes, and a wrong decision is expensive for months. |
| `dev` | opus | The genuinely hard part. Cheaping out here creates rework, which costs more than the saving. |
| `qa` | opus | Small input (one diff), small output (a verdict) — so opus is cheap here in absolute terms, and it's the only independent signal there is. |

Note the asymmetry people get wrong: **a strong model on a small context is
cheaper than a weak model on a huge one.** Opus reviewing a 200-line diff is a
minor expense. Sonnet in a 150k-token session is not. Optimise context first,
tier second.

## 5. Work a story in one sitting

Prompt caching makes repeated context cheap for a while (this session: a 1-hour
window). Finish a story in one burst and you keep paying the cached rate;
come back tomorrow mid-story and you re-pay full price for everything you'd
already sent. Batching also happens to be how you keep a story small.

## 6. Vague acceptance criteria are the most expensive thing in the loop

A story that comes back wrong costs: the dev turn, the QA turn, your review, a
rework turn, another QA turn. Five expensive turns, because a criterion was
ambiguous.

Sharpening AC at step 3 is cheap — it's you typing. It is by a wide margin the
highest-return token optimisation available, and it's the same activity that
makes you better at the job. No trade-off to manage here.

## 7. Point agents at files; don't ask them to explore

"Read `app/src/lib/distance.ts` and add a test for the antimeridian case" is a
handful of reads. "Look at how distance is calculated and improve the tests" is
a codebase crawl. You know where things are — the repo is small and you own the
structure. Spend the ten seconds.

## Anti-patterns

| Habit | What it costs |
|---|---|
| One long session across many stories | Quadratic growth; the single biggest waste available |
| Asking an agent to re-explain a decision | It's in `method/adr/` — read it for free |
| Invoking `architect` for a settled question | An ADR exists so you decide once |
| Letting a story grow mid-flight | Bigger diff, longer review, more rework |
| Re-running QA on an unchanged diff | The verdict is on the PR already |
| Skipping the phone demo to "save a cycle" | The one cost you must never optimise |
