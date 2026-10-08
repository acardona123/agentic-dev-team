// Run with:  node --test method/check-adr-register.test.mjs
// Each failure case is one the check exists to catch; if the logic for it is
// removed, its test goes red.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { checkRegister, checkRevisitSection } from './check-adr-register.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const files = ['0001-alpha.md', '0002-beta.md'];
const line = (num, file) => `- [${num}](adr/${file}) · core · **Trigger:** x. · **State:** not fired`;
const register = (...lines) => ['# Register', '', ...lines, ''].join('\n');
const adr = (...sections) => ['# 0017 — x', '**Status:** Proposed', '', ...sections, ''].join('\n');

test('a register with one line per ADR is clean', () => {
  const r = checkRegister(files, register(line('0001', '0001-alpha.md'), line('0002', '0002-beta.md')));
  assert.deepEqual(r.problems, []);
  assert.equal(r.adrCount, 2);
  assert.equal(r.entryCount, 2);
});

test('an ADR with no register line fails', () => {
  const r = checkRegister(files, register(line('0001', '0001-alpha.md')));
  assert.equal(r.problems.length, 1);
  assert.match(r.problems[0], /^0002: .*has no line/);
});

test('a register line whose number has no ADR fails', () => {
  const r = checkRegister(files, register(
    line('0001', '0001-alpha.md'), line('0002', '0002-beta.md'), line('0003', '0003-gamma.md')));
  assert.equal(r.problems.length, 1);
  assert.match(r.problems[0], /^0003: .*points to no ADR/);
});

test('a register line linking the wrong file fails', () => {
  const r = checkRegister(files, register(line('0001', '0001-alpha.md'), line('0002', '0002-old-name.md')));
  assert.equal(r.problems.length, 1);
  assert.match(r.problems[0], /^0002: .*links adr\/0002-old-name\.md/);
});

test('two lines for one ADR fail', () => {
  const r = checkRegister(files, register(
    line('0001', '0001-alpha.md'), line('0002', '0002-beta.md'), line('0002', '0002-beta.md')));
  assert.equal(r.problems.length, 1);
  assert.match(r.problems[0], /^0002: two register lines/);
});

test('an empty register fails once per ADR', () => {
  const r = checkRegister(files, register());
  assert.equal(r.problems.length, 2);
});

test('files in the ADR directory that are not numbered ADRs are ignored', () => {
  const r = checkRegister([...files, 'README.md', 'notes.txt'],
    register(line('0001', '0001-alpha.md'), line('0002', '0002-beta.md')));
  assert.deepEqual(r.problems, []);
});

// --- the `## Revisit when` section, required from 0017 on ---

test('an ADR from 0017 on without a Revisit when section fails', () => {
  const p = checkRevisitSection('0018-new.md', adr('## Decision', 'x', '## Trade-off', 'y'));
  assert.match(p ?? '', /^0018: .*no "## Revisit when" section/);
});

test('0017 itself is not exempt', () => {
  const p = checkRevisitSection('0017-register.md', adr('## Decision', 'x'));
  assert.match(p ?? '', /^0017: .*no "## Revisit when"/);
});

test('an empty Revisit when section fails', () => {
  const p = checkRevisitSection('0018-new.md', adr('## Revisit when', '', '## Alternatives rejected', '- z'));
  assert.match(p ?? '', /^0018: .*empty "## Revisit when"/);
});

test('a Revisit when section with content passes', () => {
  assert.equal(checkRevisitSection('0018-new.md',
    adr('## Revisit when', '- *Assumes X.* Revisit if not X — seen in a QA verdict.', '## Alternatives rejected')), null);
});

test('a frozen ADR below 0017 is never required to gain the section', () => {
  assert.equal(checkRevisitSection('0016-old.md', adr('## Decision', 'x')), null);
});

test('a heading that only mentions revisiting does not count as the section', () => {
  const p = checkRevisitSection('0018-new.md', adr('## When to revisit', 'x'));
  assert.match(p ?? '', /no "## Revisit when"/);
});

// --- the real CLI, run as a child process, so its exit code is what is tested ---

// The script resolves the register and adr/ beside itself, so a copy in a
// scratch directory checks that directory and nothing in the repo.
function runCli({ adrs, registerText }) {
  const root = mkdtempSync(join(tmpdir(), 'adr-register-'));
  try {
    const method = join(root, 'method');
    mkdirSync(join(method, 'adr'), { recursive: true });
    copyFileSync(join(here, 'check-adr-register.mjs'), join(method, 'check-adr-register.mjs'));
    for (const [name, text] of Object.entries(adrs)) writeFileSync(join(method, 'adr', name), text);
    if (registerText !== undefined) writeFileSync(join(method, 'adr-triggers.md'), registerText);
    return spawnSync(process.execPath, [join(method, 'check-adr-register.mjs')], { encoding: 'utf8' });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const goodAdrs = { '0001-alpha.md': adr('## Decision', 'x'), '0017-reg.md': adr('## Revisit when', '- y') };
const goodRegister = register(line('0001', '0001-alpha.md'), line('0017', '0017-reg.md'));

test('the CLI exits 0 on a clean register', () => {
  const r = runCli({ adrs: goodAdrs, registerText: goodRegister });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /OK — 2 ADRs/);
});

test('the CLI exits 1 when an ADR has no register line', () => {
  const r = runCli({ adrs: goodAdrs, registerText: register(line('0001', '0001-alpha.md')) });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /0017: .*has no line/);
});

test('the CLI exits 1 when a new ADR lacks the Revisit when section', () => {
  const r = runCli({ adrs: { ...goodAdrs, '0017-reg.md': adr('## Decision', 'x') }, registerText: goodRegister });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no "## Revisit when"/);
});

test('the CLI exits 1 when the register file is missing', () => {
  const r = runCli({ adrs: goodAdrs });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /adr-triggers\.md not found/);
});

// --- the repository itself ---

test('the repository register is complete and new ADRs carry the section', () => {
  const dir = join(here, 'adr');
  const names = readdirSync(dir);
  const r = checkRegister(names, readFileSync(join(here, 'adr-triggers.md'), 'utf8'));
  assert.deepEqual(r.problems, []);
  assert.ok(r.adrCount > 0, 'found no ADRs — the directory or the pattern moved');
  const sections = names.filter((n) => /^\d{4}-.+\.md$/.test(n))
    .map((n) => checkRevisitSection(n, readFileSync(join(dir, n), 'utf8'))).filter(Boolean);
  assert.deepEqual(sections, []);
});
