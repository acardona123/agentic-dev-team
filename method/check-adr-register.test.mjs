// Run with:  node --test method/check-adr-register.test.mjs
// Each failure case is one the check exists to catch; if the logic for it is
// removed, its test goes red.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { checkRegister } from './check-adr-register.mjs';

const files = ['0001-alpha.md', '0002-beta.md'];
const line = (num, file) => `- [${num}](adr/${file}) · core · **Trigger:** x. · **State:** not fired.`;
const register = (...lines) => ['# Register', '', ...lines, ''].join('\n');

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

test('the repository register is complete', () => {
  const method = dirname(fileURLToPath(import.meta.url));
  const r = checkRegister(readdirSync(join(method, 'adr')), readFileSync(join(method, 'adr-triggers.md'), 'utf8'));
  assert.deepEqual(r.problems, []);
  assert.ok(r.adrCount > 0, 'found no ADRs — the directory or the pattern moved');
});
