#!/usr/bin/env node
// Guards the *artifacts* of the DoD's human gate — see method/adr/0012.
// It can prove method/log/S<n>.md exists; it can never prove the demo happened.
//
// Run from anywhere:  node method/check-closeout.mjs
// Exit 0 = clean, 1 = a story was closed out with bookkeeping missing.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const backlogPath = join(repo, 'app', 'backlog.md');

// Sections that hold `### S<n>` story blocks. `## Backlog` and `## Spotted` are
// bullet lists, not stories, and are deliberately not parsed.
const STORY_SECTIONS = ['Ready', 'Doing', 'Review', 'Done'];

const problems = [];
const fail = (story, missing, fix) => problems.push({ story, missing, fix });

if (!existsSync(backlogPath)) {
  console.error('closeout: app/backlog.md not found — nothing to check.');
  process.exit(1);
}

const lines = readFileSync(backlogPath, 'utf8').split('\n');

// One pass: track the current `## Section` and the current `### S<n>` story.
let section = null;
let story = null;
const stories = [];

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

if (problems.length === 0) {
  const done = stories.filter((s) => s.section === 'Done').length;
  console.log(`closeout: OK — ${stories.length} stor${stories.length === 1 ? 'y' : 'ies'} in app/backlog.md, ${done} under "## Done", all closeout artifacts present.`);
  process.exit(0);
}

console.error(`closeout: ${problems.length} problem${problems.length > 1 ? 's' : ''} — a story was closed out with bookkeeping skipped.\n`);
for (const p of problems) {
  console.error(`  ${p.story}: ${p.missing}`);
  console.error(`      fix: ${p.fix}\n`);
}
console.error('This checks the artifacts of the human gate in method/definition-of-done.md,');
console.error('not the gate itself. Run locally with: node method/check-closeout.mjs');
process.exit(1);
