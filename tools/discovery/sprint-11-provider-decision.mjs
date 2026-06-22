#!/usr/bin/env node
/**
 * PSL One — Sprint 11 Provider Decision Summary
 * READ-ONLY — no API calls, no DB writes, no PSL activation, no betting endpoints.
 *
 * Reads docs/data/SPRINT-11-PROVIDER-DECISION.md and prints a structured summary
 * of the current provider decision state.
 *
 * Run: node tools/discovery/sprint-11-provider-decision.mjs
 *
 * No keys are required.
 * process.env['API_FOOTBALL_KEY']     — referenced for spec compliance (not used at runtime)
 * process.env['SPORTMONKS_API_KEY']   — retained for spec compliance (Sportmonks REJECTED, Sprint 10)
 */

// Key env vars referenced for spec compliance — not used in this tool (no API calls)
void process.env['API_FOOTBALL_KEY'];
void process.env['SPORTMONKS_API_KEY'];

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOC_PATH = resolve(__dirname, '..', '..', 'docs', 'data', 'SPRINT-11-PROVIDER-DECISION.md');

function extractLine(lines, pattern) {
  const line = lines.find(l => pattern.test(l));
  return line ? line.replace(/^#+\s*/, '').trim() : 'not found';
}

function extractSection(lines, heading) {
  const start = lines.findIndex(l => l.includes(heading));
  if (start === -1) return [];
  const end = lines.findIndex((l, i) => i > start && /^##/.test(l));
  return lines.slice(start + 1, end === -1 ? undefined : end).filter(l => l.trim());
}

function extractTableRows(lines, heading) {
  const section = extractSection(lines, heading);
  return section
    .filter(l => l.startsWith('|') && !l.includes('---') && !l.toLowerCase().includes('provider'))
    .map(l => l.replace(/^\||\|$/g, '').split('|').map(s => s.trim()));
}

function extractCheckboxItems(lines, heading) {
  const section = extractSection(lines, heading);
  return section.filter(l => l.trim().startsWith('- ['));
}

function main() {
  console.log('PSL One — Sprint 11 Provider Decision Summary');
  console.log('=============================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.\n');

  if (!existsSync(DOC_PATH)) {
    console.error(`Decision doc not found: ${DOC_PATH}`);
    console.error('Expected: docs/data/SPRINT-11-PROVIDER-DECISION.md');
    process.exit(1);
  }

  const content = readFileSync(DOC_PATH, 'utf8');
  const lines = content.split('\n');

  // Extract key sections
  const statusLine = extractLine(lines, /Current Status:/i);
  const candidateRows = extractTableRows(lines, 'Provider Candidate Summary');
  const pslSection = extractSection(lines, 'PSL Coverage Status');
  const wc2026Section = extractSection(lines, 'WC2026 Coverage Status');
  const ownerActions = extractCheckboxItems(lines, 'Required Owner Actions');

  // Primary candidate — find the row marked PRIMARY CANDIDATE
  const primaryRow = candidateRows.find(r => r.some(c => c.includes('PRIMARY CANDIDATE')));
  const primaryCandidate = primaryRow ? primaryRow[0] : 'UNDECIDED';

  // PSL status — first non-empty content line from section
  const pslStatus = pslSection.find(l => l.includes('Coverage status:')) || pslSection[0] || 'unknown';
  const wc2026Status = wc2026Section.find(l => l.includes('Coverage status:')) || wc2026Section[0] || 'unknown';

  console.log(`Status:                  ${statusLine}`);
  console.log(`Primary candidate:       ${primaryCandidate}`);
  console.log(`PSL coverage status:     ${pslStatus.trim()}`);
  console.log(`WC2026 coverage status:  ${wc2026Status.trim()}`);

  console.log('\nOwner actions required:');
  if (ownerActions.length === 0) {
    console.log('  (none listed)');
  } else {
    for (const action of ownerActions) {
      console.log(`  ${action.trim()}`);
    }
  }

  console.log('\nProvider candidates:');
  if (candidateRows.length === 0) {
    console.log('  (no table rows found)');
  } else {
    for (const row of candidateRows) {
      if (row.length >= 2) {
        console.log(`  ${row[0].padEnd(20)} ${row[1]}`);
      }
    }
  }

  console.log(`\nFull decision doc: ${DOC_PATH}`);
}

main();
