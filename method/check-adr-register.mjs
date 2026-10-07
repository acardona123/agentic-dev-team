#!/usr/bin/env node
// Keeps method/adr-triggers.md complete — see method/adr/0017. QA reads the
// register, not the directory, so an ADR without a line is an ADR whose revisit
// trigger no step reads. It cannot check that a trigger line is accurate, or
// that anyone read it.
//
// Run from anywhere:  node method/check-adr-register.mjs
// Exit 0 = every ADR has exactly one line and every line points to an ADR.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

// Only numbered files are ADRs; anything else in the directory is ignored, so a
// stray note there cannot make the check fire on a legitimate state.
const ADR_FILE = /^(\d{4})-.+\.md$/;
// A register line is a list item that opens with a link to an ADR.
const ENTRY = /^-\s+\[(\d{4})\]\(adr\/([^)]+)\)/;

// Pure: no filesystem, so the tests can hand it any directory and register.
export function checkRegister(adrFileNames, registerText) {
  const problems = [];
  const adrs = new Map();
  for (const name of adrFileNames) {
    const m = ADR_FILE.exec(name);
    if (m) adrs.set(m[1], name);
  }

  const seen = new Map();
  registerText.split('\n').forEach((line, i) => {
    const m = ENTRY.exec(line);
    if (!m) return;
    const [, num, target] = m;
    const where = `line ${i + 1}`;
    if (seen.has(num)) {
      problems.push(`${num}: two register lines (${seen.get(num)} and ${where}) — keep one`);
      return;
    }
    seen.set(num, where);
    if (!adrs.has(num)) {
      problems.push(`${num}: register ${where} points to no ADR — no method/adr/${num}-*.md exists`);
    } else if (adrs.get(num) !== target) {
      problems.push(`${num}: register ${where} links adr/${target}, but the ADR is adr/${adrs.get(num)}`);
    }
  });

  for (const [num, name] of adrs) {
    if (!seen.has(num)) {
      problems.push(`${num}: method/adr/${name} has no line in method/adr-triggers.md — add one, "none stated" if it names no trigger`);
    }
  }
  return { adrCount: adrs.size, entryCount: seen.size, problems };
}

function main() {
  const method = dirname(fileURLToPath(import.meta.url));
  const registerPath = join(method, 'adr-triggers.md');
  if (!existsSync(registerPath)) {
    console.error('adr-register: method/adr-triggers.md not found — every ADR needs a line there (method/adr/0017).');
    process.exit(1);
  }
  const { adrCount, entryCount, problems } = checkRegister(
    readdirSync(join(method, 'adr')),
    readFileSync(registerPath, 'utf8'),
  );
  if (problems.length === 0) {
    // The counts are printed so "0 ADRs" reads as wrong rather than as green.
    console.log(`adr-register: OK — ${adrCount} ADRs in method/adr/, ${entryCount} register lines, one each.`);
    process.exit(0);
  }
  console.error(`adr-register: ${problems.length} problem${problems.length > 1 ? 's' : ''}:\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('\nSee method/adr/0017. Run locally with: node method/check-adr-register.mjs');
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
