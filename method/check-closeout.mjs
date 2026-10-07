#!/usr/bin/env node
// Guards the *artifacts* of the DoD's human gate — see method/adr/0012.
// It can prove method/log/S<n>.md exists; it can never prove the demo happened.
// Tasks (method/adr/0014) are checked for a valid status and, once Done, for no
// unticked completion criterion. They have no log, so no log rule applies.
//
// Run from anywhere:  node method/check-closeout.mjs
// Exit 0 = clean, 1 = a work item was closed out with bookkeeping missing.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const backlogPath = join(repo, 'app', 'backlog.md');

// Sections that hold `### S<n>` story blocks. `## Backlog` and `## Spotted` are
// bullet lists, not stories, and are deliberately not parsed.
const STORY_SECTIONS = ['Ready', 'Doing', 'Review', 'Done'];
// Tasks all live in one section and carry their state on the Status line alone,
// so for them the status is checked against this set rather than a section name.
const TASK_SECTION = 'Tasks';
const TASK_STATUSES = STORY_SECTIONS;

const problems = [];
const fail = (story, missing, fix) => problems.push({ story, missing, fix });

if (!existsSync(backlogPath)) {
  console.error('closeout: app/backlog.md not found — nothing to check.');
  process.exit(1);
}

const lines = readFileSync(backlogPath, 'utf8').split('\n');

// One pass: track the current `## Section` and the current `### S<n>` story or
// `### T<n>` task (`story` holds whichever block is open).
let section = null;
let story = null;
const stories = [];
const tasks = [];

for (const line of lines) {
  const h2 = /^##\s+(\S+)/.exec(line);
  if (h2) {
    section = h2[1];
    story = null;
    continue;
  }
  const h3 = /^###\s+(S\d+)\b\s*[-—–]?\s*(.*)$/.exec(line);
  if (h3 && STORY_SECTIONS.includes(section)) {
    story = { id: h3[1], title: h3[2].trim(), section, status: null, unticked: 0 };
    stories.push(story);
    continue;
  }
  const h3t = /^###\s+(T\d+)\b\s*[-—–]?\s*(.*)$/.exec(line);
  if (h3t && section === TASK_SECTION) {
    story = { id: h3t[1], title: h3t[2].trim(), section, status: null, unticked: 0 };
    tasks.push(story);
    continue;
  }
  if (!story) continue;

  const status = /^\*\*Status:\*\*\s*(\w+)/.exec(line);
  if (status && story.status === null) story.status = status[1];
  if (/^\s*-\s*\[ \]/.test(line)) story.unticked += 1;
}

for (const s of stories) {
  // 3. Status line agrees with the section the story sits in.
  if (s.status === null) {
    fail(s.id, `no "**Status:**" line (it sits under "## ${s.section}")`,
      `add "**Status:** ${s.section}" under the "### ${s.id}" heading in app/backlog.md`);
  } else if (s.status.toLowerCase() !== s.section.toLowerCase()) {
    fail(s.id, `"**Status:** ${s.status}" but it sits under "## ${s.section}"`,
      `half-finished move: either put ${s.id} back under "## ${s.status}" or set its status to ${s.section}`);
  }

  if (s.section !== 'Done') continue;

  // 2. Done means every acceptance criterion is ticked.
  if (s.unticked > 0) {
    fail(s.id, `${s.unticked} unticked checkbox${s.unticked > 1 ? 'es' : ''} while under "## Done"`,
      'tick them, or move the story back to Doing — "Done except..." means Doing (method/definition-of-done.md)');
  }

  // 1. Done means the per-story log exists...
  const rel = `method/log/${s.id}.md`;
  const logPath = join(repo, 'method', 'log', `${s.id}.md`);
  if (!existsSync(logPath)) {
    fail(s.id, `${rel} is missing`,
      `write it before closing out — five lines, format in method/log/README.md`);
    continue;
  }

  // ...and used the template, whose point is the last line.
  if (!/^\*\*Method change:\*\*/m.test(readFileSync(logPath, 'utf8'))) {
    fail(s.id, `${rel} has no "**Method change:**" line`,
      `add it — "none" is a valid answer, an absent line is not (method/log/README.md)`);
  }
}

for (const t of tasks) {
  if (t.status === null) {
    fail(t.id, `no "**Status:**" line (it sits under "## ${TASK_SECTION}")`,
      `add "**Status:** Ready" (or Doing/Review/Done) under the "### ${t.id}" heading in app/backlog.md`);
    continue;
  }
  const known = TASK_STATUSES.find((v) => v.toLowerCase() === t.status.toLowerCase());
  if (!known) {
    fail(t.id, `"**Status:** ${t.status}" is not one of ${TASK_STATUSES.join('/')}`,
      `set it to one of ${TASK_STATUSES.join(', ')} (method/adr/0014-work-item-types.md)`);
    continue;
  }
  if (known === 'Done' && t.unticked > 0) {
    fail(t.id, `${t.unticked} unticked checkbox${t.unticked > 1 ? 'es' : ''} while "**Status:** Done"`,
      'tick them, or set the task back to Doing — "Done except..." means Doing (method/definition-of-done.md)');
  }
}

if (problems.length === 0) {
  const done = stories.filter((s) => s.section === 'Done').length;
  const tasksDone = tasks.filter((t) => t.status.toLowerCase() === 'done').length;
  console.log(`closeout: OK — ${stories.length} stor${stories.length === 1 ? 'y' : 'ies'} in app/backlog.md, ${done} under "## Done"; ${tasks.length} task${tasks.length === 1 ? '' : 's'}, ${tasksDone} Done; all closeout artifacts present.`);
  process.exit(0);
}

console.error(`closeout: ${problems.length} problem${problems.length > 1 ? 's' : ''} — a work item was closed out with bookkeeping skipped.\n`);
for (const p of problems) {
  console.error(`  ${p.story}: ${p.missing}`);
  console.error(`      fix: ${p.fix}\n`);
}
console.error('This checks the artifacts of the human gate in method/definition-of-done.md,');
console.error('not the gate itself. Run locally with: node method/check-closeout.mjs');
process.exit(1);
