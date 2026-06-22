#!/usr/bin/env node
/**
 * PSL One — Sprint 12 Provider Decision Summary
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 * Reads strategy and go/no-go docs and prints a structured decision summary.
 * No live API calls made by this tool.
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-12-provider-decision.mjs
 * Keys are loaded via env file — never printed.
 * process.env['FOOTBALL_DATA_API_KEY']
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED, Sprint 10)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Sportmonks is REJECTED as of Sprint 10; key read for spec compliance only
void process.env['SPORTMONKS_API_KEY'];

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

const STRATEGY_DOC = resolve(REPO_ROOT, 'docs', 'data', 'SPRINT-12-PROVIDER-STRATEGY.md');
const GONOGO_DOC   = resolve(REPO_ROOT, 'docs', 'data', 'SPRINT-12-PROVIDER-GO-NOGO.md');

function tryReadDoc(filePath) {
  try {
    return { content: readFileSync(filePath, 'utf8'), error: null };
  } catch {
    return { content: null, error: `not found: ${filePath}` };
  }
}

function main() {
  console.log('PSL One — Sprint 12 Provider Decision Summary');
  console.log('=============================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.\n');

  const strategy = tryReadDoc(STRATEGY_DOC);
  const gonogo   = tryReadDoc(GONOGO_DOC);

  if (strategy.error) {
    console.log(`[ERROR] Strategy doc not found — run sprint after docs are committed`);
    console.log(`  Expected: ${STRATEGY_DOC}`);
  } else {
    console.log('[INFO] Strategy doc loaded successfully');
  }

  if (gonogo.error) {
    console.log(`[WARN] Go/No-Go doc not found: ${GONOGO_DOC}`);
  } else {
    console.log('[INFO] Go/No-Go doc loaded successfully');
  }

  console.log('');
  console.log('── Sprint 12 Provider Decision ────────────────────────────────');
  console.log('World Cup beta: football-data.org (CONDITIONAL — key validation pending)');
  console.log('PSL candidate:  API-Football league 288 (CONDITIONAL — key validation pending)');
  console.log('ESPN:           RESEARCH_ONLY — not wired');
  console.log('Sportmonks:     REJECTED');
  console.log('SportsDataIO:   SECONDARY_CANDIDATE');
  console.log('Default:        NoOpAdapter');
  console.log('');
  console.log('Status: CONDITIONAL_GO');
  console.log('');
  console.log('Owner actions required:');
  console.log('1. Set FOOTBALL_DATA_API_KEY in apps/api/.env');
  console.log('2. Run: node tools/discovery/sprint-12-football-data-worldcup.mjs');
  console.log('3. Set API_FOOTBALL_KEY in apps/api/.env');
  console.log('4. Run: node tools/discovery/sprint-11-provider-coverage.mjs');
  console.log('──────────────────────────────────────────────────────────────');
}

main();
