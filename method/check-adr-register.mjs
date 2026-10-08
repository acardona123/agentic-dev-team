#!/usr/bin/env node
// Keeps method/adr-triggers.md complete — see method/adr/0017. QA reads the
// register, not the directory, so an ADR without a line is an ADR whose revisit
// trigger no step reads. It cannot check that a trigger line is accurate, that
// a trigger is observable, or that anyone read it — those are QA's reading.
//
// Run from anywhere:  node method/check-adr-register.mjs
// Exit 0 = every ADR has exactly one line, every line points to an ADR, and
// every ADR from 0017 on has a non-empty `## Revisit when` section.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

// Only numbered files are ADRs; anything else in the directory is ignored, so a
// stray note there cannot make the check fire on a legitimate state.
const ADR_FILE = /^(\d{4})-.+\.md$/;
// A register line is a list item that opens with a link to an ADR.
const ENTRY = /^-\s+\[(\d{4})\]\(adr\/([^)]+)\)/;
// ADRs below this are frozen (ADR-0015) and never gain the section; 0017 was
// still a draft when it made the rule, so it carries it (ADR-0017 §4).
export const REVISIT_SECTION_FROM = 17;

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

// Pure. Returns a problem string, or null when the ADR is exempt or compliant.
// "Empty" means no non-blank line before the next heading of level 1 or 2.
export function checkRevisitSection(fileName, text) {
  const m = ADR_FILE.exec(fileName);
  if (!m || Number(m[1]) < REVISIT_SECTION_FROM) return null;
  const lines = text.split('\n');
  const start = lines.findIndex((l) => /^##\s+Revisit when\s*$/.test(l));
  if (start === -1) {
    return `${m[1]}: method/adr/${fileName} has no "## Revisit when" section — required from ${String(REVISIT_SECTION_FROM).padStart(4, '0')} on`;
  }
  for (const l of lines.slice(start + 1)) {
    if (/^#{1,2}\s/.test(l)) break;
    if (l.trim() !== '') return null;
  }
  return `${m[1]}: method/adr/${fileName} has an empty "## Revisit when" section — write its premises and triggers`;
}

// Returns the exit code rather than exiting, so the CLI line below is the only
// place that touches the process; the tests run that line as a child process.
export function main(methodDir) {
  const registerPath = join(methodDir, 'adr-triggers.md');
  if (!existsSync(registerPath)) {
    console.error('adr-register: method/adr-triggers.md not found — every ADR needs a line there (method/adr/0017).');
    return 1;
  }
  const adrDir = join(methodDir, 'adr');
  const names = readdirSync(adrDir);
  const { adrCount, entryCount, problems } = checkRegister(names, readFileSync(registerPath, 'utf8'));
  for (const name of names) {
    const p = checkRevisitSection(name, ADR_FILE.test(name) ? readFileSync(join(adrDir, name), 'utf8') : '');
    if (p) problems.push(p);
  }
  if (problems.length === 0) {
    // The counts are printed so "0 ADRs" reads as wrong rather than as green.
    console.log(`adr-register: OK — ${adrCount} ADRs in method/adr/, ${entryCount} register lines, one each.`);
    return 0;
  }
  console.error(`adr-register: ${problems.length} problem${problems.length > 1 ? 's' : ''}:\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('\nSee method/adr/0017. Run locally with: node method/check-adr-register.mjs');
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(dirname(fileURLToPath(import.meta.url))));
}
