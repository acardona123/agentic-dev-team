// Run with:  node --test method/check-closeout.test.mjs
// Each failure case is one the check exists to catch; if the logic for it is
// removed, its test goes red. Layout under test: method/adr/0018.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { checkBacklog } from './check-closeout.mjs';

const here = dirname(fileURLToPath(import.meta.url));

const item = (id, status, ...body) => [`### ${id} — title`, `**Status:** ${status}`, '', ...body, ''].join('\n');
const readme = (...entries) => ['# Backlog', '', '## Backlog', '', ...entries, ''].join('\n');
const entry = (id) => `- **${id} — something.** One line.`;
const goodLog = '# S0\n\n**Method change:** none\n';

// A clean baseline: one live task, one live story, one Done story, one Done task.
const base = () => ({
  files: {
    'README.md': readme(entry('T8'), entry('S2'), '- **Revisit ADR-0011** — not yet drafted.'),
    'spotted.md': '## Spotted\n\n- an open entry\n',
    'T8.md': item('T8', 'Doing', '- [ ] CC1 — x'),
    'S2.md': item('S2', 'Review', '- [x] AC1 — x'),
    'archive/S0.md': item('S0', 'Done · demoed', '- [x] AC1 — x'),
    'archive/T1.md': item('T1', 'Done · confirmed', '- [x] CC1 — x'),
    'archive/spotted.md': '## Spotted — closed\n\n- ~~a closed entry~~\n',
  },
  logs: { S0: goodLog },
  legacyExists: false,
});
const run = (mutate) => { const s = base(); mutate?.(s); return checkBacklog(s); };
const only = (r, re) => {
  assert.equal(r.problems.length, 1, JSON.stringify(r.problems, null, 1));
  assert.match(`${r.problems[0].who}: ${r.problems[0].missing}`, re);
};

test('the baseline layout is clean, and counts what it found', () => {
  const r = run();
  assert.deepEqual(r.problems, []);
  assert.deepEqual([r.live, r.archived, r.entries], [2, 2, 2]);
});

// --- Status, and Draft (ADR-0018 §2) ---

test('Draft is accepted for a live task and a live story', () => {
  const r = run((s) => { s.files['T8.md'] = item('T8', 'Draft'); s.files['S2.md'] = item('S2', 'Draft'); });
  assert.deepEqual(r.problems, []);
});

test('every live status is accepted', () => {
  for (const st of ['Draft', 'Ready', 'Doing', 'Review']) {
    assert.deepEqual(run((s) => { s.files['T8.md'] = item('T8', st); }).problems, [], st);
  }
});

test('Draft among the Done items fails, for a task and for a story', () => {
  only(run((s) => { s.files['archive/T1.md'] = item('T1', 'Draft'); }), /^T1: .*Draft.*only Done items go/);
  only(run((s) => { s.files['archive/S0.md'] = item('S0', 'Draft'); }), /^S0: .*Draft.*only Done items go/);
});

test('a task Status outside the accepted set fails', () => {
  only(run((s) => { s.files['T8.md'] = item('T8', 'WIP'); }), /^T8: .*WIP.* is not one of/);
});

test('an item with no Status line fails', () => {
  only(run((s) => { s.files['T8.md'] = '### T8 — title\n\nno status\n'; }), /^T8: .*no "\*\*Status:\*\*" line/);
});

// --- Status vs place (ADR-0012 rule 3, now "names the place") ---

test('a story Done but still in the live view fails', () => {
  const r = run((s) => { s.files['S2.md'] = item('S2', 'Done'); });
  assert.ok(r.problems.some((p) => p.who === 'S2' && /sits in app\/backlog\/, the live view/.test(p.missing)));
});

test('a story archived with a live Status fails', () => {
  only(run((s) => { s.files['archive/S0.md'] = item('S0', 'Review'); }), /^S0: .*Review.*archive/);
});

// --- Done bookkeeping (ADR-0012 rules 1, 2, 4) ---

test('an unticked checkbox on a Done story fails', () => {
  only(run((s) => { s.files['archive/S0.md'] = item('S0', 'Done', '- [ ] AC2 — y'); }), /^S0: 1 unticked checkbox/);
});

test('an unticked checkbox on a Done task fails', () => {
  only(run((s) => { s.files['archive/T1.md'] = item('T1', 'Done', '- [x] a', '  - [ ] b'); }), /^T1: 1 unticked checkbox/);
});

test('unticked boxes on a live item are fine', () => {
  assert.deepEqual(run((s) => { s.files['T8.md'] = item('T8', 'Doing', '- [ ] a', '- [ ] b'); }).problems, []);
});

test('a Done story with no log fails', () => {
  only(run((s) => { s.logs = {}; }), /^S0: method\/log\/S0\.md is missing/);
});

test('a Done story whose log has no Method change line fails', () => {
  only(run((s) => { s.logs = { S0: '# S0\n\nMethod change: none\n' }; }), /^S0: .*no "\*\*Method change:\*\*" line/);
});

test('a Done task needs no log', () => {
  assert.deepEqual(run((s) => { s.logs = { S0: goodLog }; }).problems, []);
});

// --- misplaced and mis-attributed items (CC4) ---

test('a second item heading inside a file fails, naming both', () => {
  const r = run((s) => { s.files['archive/S0.md'] = item('S0', 'Done', '- [x] a') + item('T9', 'Ready', '- [ ] b'); });
  assert.ok(r.problems.some((p) => p.who === 'S0' && /also holds T9/.test(p.missing)), JSON.stringify(r.problems));
});

test('a file headed with another ID than its name fails', () => {
  only(run((s) => { s.files['T8.md'] = item('T7', 'Doing'); }), /^T8: .*is headed T7/);
});

test('an item file in an unknown place fails, naming it', () => {
  only(run((s) => { s.files['done/T7.md'] = item('T7', 'Done'); }), /^app\/backlog\/done\/T7\.md: is not a place/);
  only(run((s) => { s.files['notes.md'] = 'x'; }), /^app\/backlog\/notes\.md: is not a place/);
});

test('one ID both live and archived fails', () => {
  const r = run((s) => { s.files['archive/T8.md'] = item('T8', 'Done'); });
  assert.ok(r.problems.some((p) => p.who === 'T8' && /is both/.test(p.missing)), JSON.stringify(r.problems));
});

// --- the order (ADR-0018 §4) ---

test('a live item with no Backlog entry fails', () => {
  only(run((s) => { s.files['README.md'] = readme(entry('S2')); }), /^T8: .*no `## Backlog` entry/);
});

test('a brand-new Draft with no Backlog entry yet passes: its entry is the next, planning, commit', () => {
  assert.deepEqual(run((s) => {
    s.files['README.md'] = readme(entry('T8'), entry('S2'));
    s.files['T9.md'] = item('T9', 'Draft', '- [ ] CC1 — x');
    s.files['S3.md'] = item('S3', 'Draft', '- [ ] AC1 — x');
  }).problems, []);
});

test('from Ready on, an item with no Backlog entry fails', () => {
  for (const st of ['Ready', 'Doing', 'Review']) {
    only(run((s) => { s.files['T9.md'] = item('T9', st); }), new RegExp(`^T9: is ${st} but has no \`## Backlog\` entry`));
  }
});

test('a Status spelt in another case fails', () => {
  only(run((s) => { s.files['T8.md'] = item('T8', 'doing'); }), /^T8: "\*\*Status:\*\* doing" is not one of/);
  only(run((s) => { s.files['archive/T1.md'] = item('T1', 'DONE'); }), /^T1: "\*\*Status:\*\* DONE" is not one of/);
});

test('a Done item still listed in Backlog fails', () => {
  only(run((s) => { s.files['README.md'] = readme(entry('T8'), entry('S2'), entry('T1')); }), /^T1: is Done but still has/);
});

test('two entries for one ID fail', () => {
  only(run((s) => { s.files['README.md'] = readme(entry('T8'), entry('S2'), entry('T8')); }), /^T8: two `## Backlog` entries/);
});

test('an entry for an item not yet drafted passes', () => {
  assert.deepEqual(run((s) => { s.files['README.md'] = readme(entry('T8'), entry('S2'), entry('T9')); }).problems, []);
});

test('an entry outside the Backlog section does not count', () => {
  const r = run((s) => { s.files['README.md'] = ['## How to read', entry('T8'), readme(entry('S2'))].join('\n'); });
  only(r, /^T8: .*no `## Backlog` entry/);
});

test('a README with no Backlog heading fails', () => {
  const r = run((s) => { s.files['README.md'] = '# Backlog\n\n## Order\n\n- **T8 — x**\n'; });
  assert.ok(r.problems.some((p) => /no `## Backlog` heading/.test(p.missing)));
});

test('a missing README fails', () => {
  const r = run((s) => { delete s.files['README.md']; });
  assert.ok(r.problems.some((p) => p.who === 'app/backlog/README.md' && /missing/.test(p.missing)));
});

test('the old single-file backlog beside the directory fails', () => {
  only(run((s) => { s.legacyExists = true; }), /^app\/backlog\.md: .*still exists/);
});

// --- the real CLI, run as a child process, so its exit code is what is tested ---

// The script resolves the repo as its own parent, so a copy in a scratch
// directory checks that directory and nothing in this repo.
function runCli({ files, logs = {}, legacy = false }) {
  const root = mkdtempSync(join(tmpdir(), 'closeout-'));
  try {
    mkdirSync(join(root, 'method', 'log'), { recursive: true });
    copyFileSync(join(here, 'check-closeout.mjs'), join(root, 'method', 'check-closeout.mjs'));
    for (const [rel, text] of Object.entries(files)) {
      const p = join(root, 'app', 'backlog', ...rel.split('/'));
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, text);
    }
    for (const [id, text] of Object.entries(logs)) writeFileSync(join(root, 'method', 'log', `${id}.md`), text);
    if (legacy) writeFileSync(join(root, 'app', 'backlog.md'), '# old\n');
    return spawnSync(process.execPath, [join(root, 'method', 'check-closeout.mjs')], { encoding: 'utf8' });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('the CLI exits 0 on a clean layout', () => {
  const { files, logs } = base();
  const r = runCli({ files, logs });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /OK — 2 live items .* 2 Done items/);
});

test('the CLI exits 0 on a draft commit that adds only a new item file (QA F1)', () => {
  const { files, logs } = base();
  const r = runCli({ files: { ...files, 'T9.md': item('T9', 'Draft', '- [ ] CC1 — x') }, logs });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /OK — 3 live items/);
});

test('the CLI exits 1 when a Done story has no log', () => {
  const r = runCli({ files: base().files });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /S0: method\/log\/S0\.md is missing/);
});

test('the CLI exits 1 when the old app/backlog.md still exists', () => {
  const { files, logs } = base();
  const r = runCli({ files, logs, legacy: true });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /app\/backlog\.md: .*still exists/);
});

test('the CLI exits 1 when there is no backlog directory', () => {
  const r = runCli({ files: {} });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /README\.md: missing/);
});
