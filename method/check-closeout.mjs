#!/usr/bin/env node
// Guards the *artifacts* of the DoD's human gate (method/adr/0012) in the
// backlog layout of method/adr/0018. It can prove method/log/S<n>.md exists; it
// can never prove the demo happened.
//
// Run from anywhere:  node method/check-closeout.mjs
// Exit 0 = clean, 1 = a work item sits in the wrong place or was closed out
// with bookkeeping missing.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';

export const LIVE_STATUSES = ['Draft', 'Ready', 'Doing', 'Review'];
export const DONE = 'Done';
const ITEM_FILE = /^([ST]\d+)\.md$/;
// Any heading naming an item, at any level: a second one in a file is another
// item's text being counted against this one.
const ITEM_HEADING = /^#{1,6}\s+([ST]\d+)\b/;
const ENTRY = /^-\s+\*\*([ST]\d+)\b/;
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// Pure: `files` maps paths relative to app/backlog/ (forward slashes) to text;
// `logs` maps a story ID to its log text, absent when the log does not exist;
// `legacyExists` says whether app/backlog.md is still there.
export function checkBacklog({ files, logs, legacyExists }) {
  const problems = [];
  const fail = (who, missing, fix) => problems.push({ who, missing, fix });

  if (legacyExists) {
    fail('app/backlog.md', 'the single-file backlog still exists beside app/backlog/',
      'move its content into app/backlog/ and delete it (method/adr/0018 §1)');
  }
  const readme = files['README.md'];
  if (readme === undefined) {
    fail('app/backlog/README.md', 'missing — it holds the order (`## Backlog`) and the read recipes',
      'create it (method/adr/0018 §1)');
  }

  const live = new Map();
  const archived = new Map();
  for (const [path, text] of Object.entries(files)) {
    if (path === 'README.md' || path === 'spotted.md' || path === 'archive/spotted.md') continue;
    const parts = path.split('/');
    const m = ITEM_FILE.exec(parts[parts.length - 1]);
    if (m && parts.length === 1) live.set(m[1], { id: m[1], path, text });
    else if (m && parts.length === 2 && parts[0] === 'archive') archived.set(m[1], { id: m[1], path, text });
    else {
      fail(`app/backlog/${path}`, 'is not a place method/adr/0018 §1 allows, so neither read recipe reads it',
        'a live item is app/backlog/<ID>.md, a Done one app/backlog/archive/<ID>.md; Spotted entries go in spotted.md or archive/spotted.md');
    }
  }

  // The order: top-level bullets of `## Backlog` that name an item.
  const entries = new Map();
  if (readme !== undefined) {
    let inBacklog = false;
    let sawHeading = false;
    readme.split('\n').forEach((line, i) => {
      if (/^##\s/.test(line)) {
        inBacklog = /^##\s+Backlog\b/.test(line);
        sawHeading ||= inBacklog;
        return;
      }
      const e = inBacklog && ENTRY.exec(line);
      if (!e) return;
      if (entries.has(e[1])) {
        fail(e[1], `two \`## Backlog\` entries (README.md lines ${entries.get(e[1])} and ${i + 1})`, 'keep one');
      } else entries.set(e[1], i + 1);
    });
    if (!sawHeading) {
      fail('app/backlog/README.md', 'has no `## Backlog` heading, so the order has nowhere to be',
        'add it (method/adr/0018 §4)');
    }
  }

  const items = [...live.values(), ...archived.values()];
  for (const it of items) {
    const isLive = live.has(it.id) && live.get(it.id) === it;
    const where = `app/backlog/${it.path}`;
    const lines = it.text.split('\n');

    const headings = lines.map((l) => ITEM_HEADING.exec(l)).filter(Boolean).map((h) => h[1]);
    if (headings.length === 0) {
      fail(it.id, `${where} has no "### ${it.id} — title" heading`, 'the item\'s block starts with its heading');
    } else if (headings[0] !== it.id) {
      fail(it.id, `${where} is headed ${headings[0]}`, `the file name and the heading must name the same item`);
    }
    if (headings.length > 1) {
      fail(it.id, `${where} also holds ${headings.slice(1).join(', ')} — another item's lines would be counted as ${it.id}'s`,
        'one item per file: move it to its own file');
    }

    const statusLine = lines.map((l) => /^\*\*Status:\*\*\s*(\w+)/.exec(l)).find(Boolean);
    const status = statusLine ? statusLine[1] : null;
    const known = status && [...LIVE_STATUSES, DONE].find((s) => s.toLowerCase() === status.toLowerCase());
    if (!status) {
      fail(it.id, `${where} has no "**Status:**" line`,
        `add one: ${isLive ? LIVE_STATUSES.join('/') : DONE} (method/adr/0018 §2)`);
    } else if (!known) {
      fail(it.id, `"**Status:** ${status}" is not one of ${[...LIVE_STATUSES, DONE].join('/')}`,
        'method/adr/0018 §2');
    } else if (isLive && known === DONE) {
      fail(it.id, `"**Status:** Done" but it sits in app/backlog/, the live view`,
        `half-finished close: git mv ${where} app/backlog/archive/${it.id}.md and remove its \`## Backlog\` entry, or set its status back`);
    } else if (!isLive && known !== DONE) {
      fail(it.id, `"**Status:** ${known}" but it sits in app/backlog/archive/, where only Done items go`,
        `git mv ${where} app/backlog/${it.id}.md, or finish closing it`);
    }

    if (isLive) {
      if (archived.has(it.id)) {
        fail(it.id, `is both app/backlog/${it.id}.md and app/backlog/archive/${it.id}.md`, 'keep one');
      }
      if (!entries.has(it.id)) {
        fail(it.id, 'is not Done but has no `## Backlog` entry in README.md',
          'its one-line entry stays in the order until it is Done (method/adr/0018 §4)');
      }
      continue;
    }

    if (entries.has(it.id)) {
      fail(it.id, `is Done but still has a \`## Backlog\` entry (README.md line ${entries.get(it.id)})`,
        'remove it in the Done or closeout commit (method/adr/0018 §4)');
    }
    const unticked = lines.filter((l) => /^\s*-\s*\[ \]/.test(l)).length;
    if (unticked > 0) {
      fail(it.id, `${plural(unticked, 'unticked checkbox', 'unticked checkboxes')} while archived as Done`,
        'tick them, or move it back to Doing — "Done except..." means Doing (method/definition-of-done.md)');
    }
    if (it.id.startsWith('S')) {
      const rel = `method/log/${it.id}.md`;
      const log = logs[it.id];
      if (log === undefined) {
        fail(it.id, `${rel} is missing`, 'write it before closing out — format in method/log/README.md');
      } else if (!/^\*\*Method change:\*\*/m.test(log)) {
        fail(it.id, `${rel} has no "**Method change:**" line`,
          'add it — "none" is a valid answer, an absent line is not (method/log/README.md)');
      }
    }
  }

  return { live: live.size, archived: archived.size, entries: entries.size, problems };
}

function walk(dir, root = dir, out = {}) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, root, out);
    else if (name.endsWith('.md')) out[relative(root, full).split(sep).join('/')] = readFileSync(full, 'utf8');
  }
  return out;
}

// Returns the exit code rather than exiting, so the CLI line below is the only
// place that touches the process; the tests run that line as a child process.
export function main(repo) {
  const backlogDir = join(repo, 'app', 'backlog');
  const legacyExists = existsSync(join(repo, 'app', 'backlog.md'));
  const files = existsSync(backlogDir) ? walk(backlogDir) : {};
  const logs = {};
  const logDir = join(repo, 'method', 'log');
  if (existsSync(logDir)) {
    for (const name of readdirSync(logDir)) {
      const m = /^(S\d+)\.md$/.exec(name);
      if (m) logs[m[1]] = readFileSync(join(logDir, name), 'utf8');
    }
  }

  const { live, archived, entries, problems } = checkBacklog({ files, logs, legacyExists });
  if (problems.length === 0) {
    // Counts printed so "0 items" reads as wrong rather than as green.
    console.log(`closeout: OK — ${plural(live, 'live item')} in app/backlog/, ${plural(archived, 'Done item')} in app/backlog/archive/, ${plural(entries, '`## Backlog` entry', '`## Backlog` entries')} naming an item; all closeout artifacts present.`);
    return 0;
  }
  console.error(`closeout: ${plural(problems.length, 'problem')} — a work item is misplaced or was closed out with bookkeeping skipped.\n`);
  for (const p of problems) {
    console.error(`  ${p.who}: ${p.missing}`);
    console.error(`      fix: ${p.fix}\n`);
  }
  console.error('This checks the artifacts of the human gate in method/definition-of-done.md,');
  console.error('not the gate itself. Layout: method/adr/0018. Run locally with: node method/check-closeout.mjs');
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(join(dirname(fileURLToPath(import.meta.url)), '..')));
}
