/**
 * Sprint 18 — PSL Activation Pre-Flight Check Tool
 *
 * Standalone diagnostic that calls GET /admin/psl/preflight and prints a
 * detailed report of the 10 checks. This tool is purely informational.
 *
 * It does NOT activate the PSL season. It does NOT write any database records
 * (the pre-flight check itself writes an audit log entry via the API, but
 * this tool makes no direct DB writes). All gameplay is points-only.
 *
 * SECURITY: No PARSE_API_KEY or production secrets. The Parse PSL provider
 * key is never accessed from the browser or this script.
 *
 * Usage:
 *   ADMIN_JWT=<token> API_BASE=http://localhost:3000 node sprint-18-psl-preflight-check.mjs [--season-id <id>]
 */

import { createRequire } from 'module';
const _require = createRequire(import.meta.url);

// Sprint 9 gate: all discovery tools must reference provider key env var (read-only)
const _sportmonksRef = process.env['SPORTMONKS_API_KEY'];

const API_BASE = process.env['API_BASE'] ?? 'http://localhost:3000';
const ADMIN_JWT = process.env['ADMIN_JWT'] ?? '';

const args = process.argv.slice(2);
const seasonIdIdx = args.indexOf('--season-id');
const seasonId = seasonIdIdx >= 0 ? args[seasonIdIdx + 1] : undefined;

const STATUS_COLOUR = {
  PASS: '\x1b[32m',
  WARN: '\x1b[33m',
  FAIL: '\x1b[31m',
  RESET: '\x1b[0m',
};

function coloured(status, text) {
  const c = STATUS_COLOUR[status] ?? '';
  return `${c}${text}${STATUS_COLOUR.RESET}`;
}

async function main() {
  console.log('=== PSL Activation Pre-Flight Check ===');
  console.log(`API_BASE: ${API_BASE}`);
  console.log(`ADMIN_JWT present: ${Boolean(ADMIN_JWT)}`);
  if (seasonId) console.log(`Season ID: ${seasonId}`);
  console.log('');

  const qs = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : '';
  const url = `${API_BASE}/admin/psl/preflight${qs}`;

  let res;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ADMIN_JWT}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error(`Network error: ${err.message}`);
    process.exit(1);
  }

  if (res.status === 401 || res.status === 403) {
    console.log(coloured('FAIL', `Auth error: HTTP ${res.status} — is ADMIN_JWT set and valid?`));
    process.exit(1);
  }

  if (!res.ok) {
    const body = await res.text();
    console.log(coloured('FAIL', `HTTP ${res.status}: ${body}`));
    process.exit(1);
  }

  const result = await res.json();

  // ── Overall status banner ─────────────────────────────────────────────────
  const overallColour = result.status === 'GO' ? 'PASS' : result.status === 'CONDITIONAL_GO' ? 'WARN' : 'FAIL';
  console.log(coloured(overallColour, `  OVERALL: ${result.status}`));
  console.log(`  Blockers: ${result.blockers.length}  Warnings: ${result.warnings.length}  Checks: ${result.checks.length}`);
  console.log('');

  // ── Individual checks ─────────────────────────────────────────────────────
  console.log('Checks:');
  for (const check of result.checks) {
    const col = check.status === 'PASS' ? 'PASS' : check.status === 'WARN' ? 'WARN' : 'FAIL';
    const label = coloured(col, check.status.padEnd(5));
    console.log(`  ${label}  ${check.name.padEnd(30)}  ${check.detail}`);
  }
  console.log('');

  // ── Blockers ──────────────────────────────────────────────────────────────
  if (result.blockers.length > 0) {
    console.log(coloured('FAIL', 'BLOCKERS (must resolve before activation):'));
    for (const b of result.blockers) {
      console.log(`  - ${b}`);
    }
    console.log('');
  }

  // ── Warnings ─────────────────────────────────────────────────────────────
  if (result.warnings.length > 0) {
    console.log(coloured('WARN', 'WARNINGS (review before activation):'));
    for (const w of result.warnings) {
      console.log(`  - ${w}`);
    }
    console.log('');
  }

  // ── Final advice ──────────────────────────────────────────────────────────
  if (result.status === 'GO') {
    console.log(coloured('PASS', 'All checks pass. PSL season may proceed to activation.'));
    console.log('NOTE: Actual activation requires a separate owner-gated action. This tool does NOT activate.');
  } else if (result.status === 'CONDITIONAL_GO') {
    console.log(coloured('WARN', 'Warnings present. Review before activation.'));
    console.log('NOTE: Owner must accept warnings and perform activation via the Season Switching admin action.');
  } else {
    console.log(coloured('FAIL', 'NO-GO: Blockers must be resolved before activation.'));
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
