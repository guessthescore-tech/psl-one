#!/usr/bin/env node
/**
 * PSL One Documentation Validation Script
 *
 * Validates that documentation is internally consistent with the actual codebase.
 * Run with: node scripts/validate-docs.mjs
 *
 * Checks:
 *   1. ADR files exist for ADR-001 through ADR-026
 *   2. ADR README index matches actual files
 *   3. All required ADR sections are present
 *   4. Page count in FRONTEND-ROUTES.md matches actual page.tsx count
 *   5. Model count in DATABASE-MODELS.md matches actual Prisma schema
 *   6. Migration count in MIGRATIONS.md matches actual migration directories
 *   7. docs/platform/ files carry the historical notice banner
 *   8. Required documentation files exist
 *   9. CONTRIBUTING.md references ADR-026
 *  10. No stale NEXT_PUBLIC_API_URL references in new docs
 *  11. No encoding artefacts in reference docs
 *  12. No duplicate route rows in API-ROUTES.md
 *  13. No duplicate route rows in FRONTEND-ROUTES.md
 *  14. No malformed table rows in API-ROUTES.md
 *  15. No duplicate headings in reference docs
 *  16. No stale four-digit ADR references (ADR-0001 etc.)
 *  17. No duplicate model entries in DATABASE-MODELS.md
 *  18. Declared model count matches unique model rows
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const PASS = '\x1b[32mPASS\x1b[0m';
const FAIL = '\x1b[31mFAIL\x1b[0m';
const WARN = '\x1b[33mWARN\x1b[0m';
const INFO = '\x1b[36mINFO\x1b[0m';

let failures = 0;
let warnings = 0;

function pass(msg) { console.log(`  ${PASS}  ${msg}`); }
function fail(msg) { console.log(`  ${FAIL}  ${msg}`); failures++; }
function warn(msg) { console.log(`  ${WARN}  ${msg}`); warnings++; }
function info(msg) { console.log(`  ${INFO}  ${msg}`); }

function fileExists(rel) {
  return existsSync(join(ROOT, rel));
}

function readFile(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function countFiles(dir, pattern) {
  try {
    const result = execSync(
      `find ${join(ROOT, dir)} -type f -name "${pattern}" | wc -l`,
      { encoding: 'utf8' }
    ).trim();
    return parseInt(result, 10);
  } catch {
    return 0;
  }
}

function countLines(content, pattern) {
  return content.split('\n').filter(l => pattern.test(l)).length;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 1: ADR files exist (ADR-001 through ADR-026)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 1: ADR files exist (ADR-001 through ADR-026)');
for (let i = 1; i <= 26; i++) {
  const num = String(i).padStart(3, '0');
  const path = `docs/adr/ADR-${num}.md`;
  if (fileExists(path)) {
    pass(`ADR-${num}.md exists`);
  } else {
    fail(`ADR-${num}.md is MISSING`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 2: ADR README index completeness
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 2: ADR README index completeness');
if (fileExists('docs/adr/README.md')) {
  const readme = readFile('docs/adr/README.md');
  for (let i = 1; i <= 26; i++) {
    const num = String(i).padStart(3, '0');
    if (readme.includes(`ADR-${num}`)) {
      pass(`ADR-${num} referenced in ADR README`);
    } else {
      fail(`ADR-${num} NOT referenced in docs/adr/README.md`);
    }
  }
} else {
  fail('docs/adr/README.md is MISSING');
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 3: Required ADR sections (Sprint 2 ADRs only)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 3: Required ADR sections in Sprint 2 ADRs (ADR-012 to ADR-026)');
const REQUIRED_SECTIONS = [
  '## Context',
  '## Decision',
  '## Alternatives Considered',
  '## Consequences',
  '## Related Stories',
  '## Related Source Files',
  '## Revisit Triggers',
];
for (let i = 12; i <= 26; i++) {
  const num = String(i).padStart(3, '0');
  const path = `docs/adr/ADR-${num}.md`;
  if (!fileExists(path)) continue;
  const content = readFile(path);
  const missing = REQUIRED_SECTIONS.filter(s => !content.includes(s));
  if (missing.length > 0) {
    for (const m of missing) {
      fail(`ADR-${num}.md is missing section: ${m}`);
    }
  } else {
    pass(`ADR-${num}.md has all required sections`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 4: Frontend page count matches docs
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 4: Frontend page count');
const actualPageCount = countFiles('apps/web/src/app', 'page.tsx');
info(`Actual page.tsx count: ${actualPageCount}`);
if (fileExists('docs/reference/FRONTEND-ROUTES.md')) {
  const content = readFile('docs/reference/FRONTEND-ROUTES.md');
  const match = content.match(/\*\*Total pages:\*\*\s*(\d+)/);
  if (match) {
    const docCount = parseInt(match[1], 10);
    if (docCount === actualPageCount) {
      pass(`FRONTEND-ROUTES.md count (${docCount}) matches actual (${actualPageCount})`);
    } else {
      fail(`FRONTEND-ROUTES.md says ${docCount} pages but actual is ${actualPageCount}`);
    }
  } else {
    warn('FRONTEND-ROUTES.md has no "Total pages:" declaration');
  }
} else {
  fail('docs/reference/FRONTEND-ROUTES.md is MISSING');
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 5: Prisma model count matches docs
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 5: Prisma model count');
const schemaPath = join(ROOT, 'apps/api/prisma/schema.prisma');
if (existsSync(schemaPath)) {
  const schema = readFileSync(schemaPath, 'utf8');
  const actualModelCount = countLines(schema, /^model /);
  info(`Actual Prisma model count: ${actualModelCount}`);
  if (fileExists('docs/reference/DATABASE-MODELS.md')) {
    const content = readFile('docs/reference/DATABASE-MODELS.md');
    const match = content.match(/\*\*Total models:\*\*\s*(\d+)/);
    if (match) {
      const docCount = parseInt(match[1], 10);
      if (docCount === actualModelCount) {
        pass(`DATABASE-MODELS.md count (${docCount}) matches actual (${actualModelCount})`);
      } else {
        fail(`DATABASE-MODELS.md says ${docCount} models but actual is ${actualModelCount}`);
      }
    } else {
      warn('DATABASE-MODELS.md has no "Total models:" declaration');
    }
  } else {
    fail('docs/reference/DATABASE-MODELS.md is MISSING');
  }
} else {
  fail('apps/api/prisma/schema.prisma is MISSING');
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 6: Migration count matches docs
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 6: Migration count');
const migrationsDir = join(ROOT, 'apps/api/prisma/migrations');
if (existsSync(migrationsDir)) {
  const migrations = readdirSync(migrationsDir).filter(d => {
    const stat = statSync(join(migrationsDir, d));
    return stat.isDirectory() && /^\d{14}/.test(d);
  });
  const actualMigrationCount = migrations.length;
  info(`Actual migration count: ${actualMigrationCount}`);
  if (fileExists('docs/reference/MIGRATIONS.md')) {
    const content = readFile('docs/reference/MIGRATIONS.md');
    const match = content.match(/\*\*Total migrations:\*\*\s*(\d+)/);
    if (match) {
      const docCount = parseInt(match[1], 10);
      if (docCount === actualMigrationCount) {
        pass(`MIGRATIONS.md count (${docCount}) matches actual (${actualMigrationCount})`);
      } else {
        fail(`MIGRATIONS.md says ${docCount} migrations but actual is ${actualMigrationCount}`);
      }
    } else {
      warn('MIGRATIONS.md has no "Total migrations:" declaration');
    }
  } else {
    fail('docs/reference/MIGRATIONS.md is MISSING');
  }
} else {
  fail('apps/api/prisma/migrations directory is MISSING');
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 7: docs/platform/ files have historical notice
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 7: docs/platform/ files carry historical notice');
const HISTORICAL_BANNER = '> **Historical Implementation Record';
const platformDir = join(ROOT, 'docs/platform');
if (existsSync(platformDir)) {
  const platformFiles = readdirSync(platformDir).filter(f => f.endsWith('.md'));
  for (const file of platformFiles) {
    const content = readFileSync(join(platformDir, file), 'utf8');
    if (content.includes(HISTORICAL_BANNER)) {
      pass(`docs/platform/${file} has historical notice`);
    } else {
      warn(`docs/platform/${file} is MISSING historical notice banner`);
    }
  }
} else {
  warn('docs/platform/ directory not found');
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 8: Required documentation files exist
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 8: Required documentation files exist');
const REQUIRED_FILES = [
  'README.md',
  'CONTRIBUTING.md',
  'docs/README.md',
  'docs/adr/README.md',
  'docs/project/CURRENT-STATE.md',
  'docs/project/STORY-INDEX.md',
  'docs/project/ROADMAP.md',
  'docs/project/GLOSSARY.md',
  'docs/project/DELIVERY-TIMELINE.md',
  'docs/architecture/SYSTEM-OVERVIEW.md',
  'docs/architecture/BOUNDED-CONTEXT-MAP.md',
  'docs/architecture/CONTAINER-ARCHITECTURE.md',
  'docs/architecture/DATA-ARCHITECTURE.md',
  'docs/architecture/EVENT-AND-SIDE-EFFECTS.md',
  'docs/architecture/SECURITY-ARCHITECTURE.md',
  'docs/architecture/INTEGRATION-ARCHITECTURE.md',
  'docs/architecture/MODULE-DEPENDENCIES.md',
  'docs/architecture/MULTI-SEASON-ARCHITECTURE.md',
  'docs/architecture/FRONTEND-ARCHITECTURE.md',
  'docs/engineering/LOCAL-DEVELOPMENT.md',
  'docs/engineering/REPOSITORY-GUIDE.md',
  'docs/engineering/BACKEND-GUIDE.md',
  'docs/engineering/FRONTEND-GUIDE.md',
  'docs/engineering/DATABASE-GUIDE.md',
  'docs/engineering/TESTING-GUIDE.md',
  'docs/engineering/CODING-STANDARDS.md',
  'docs/engineering/ERROR-HANDLING.md',
  'docs/engineering/AUTH-AND-RBAC.md',
  'docs/engineering/ADDING-A-NEW-FEATURE.md',
  'docs/engineering/ADDING-A-NEW-SEASON.md',
  'docs/engineering/ADDING-A-PROVIDER-ADAPTER.md',
  'docs/engineering/TROUBLESHOOTING.md',
  'docs/domain/FOOTBALL-CORE.md',
  'docs/domain/CLUBS-AND-PLAYERS.md',
  'docs/domain/FIXTURES-AND-MATCHDAY.md',
  'docs/domain/FANTASY.md',
  'docs/domain/PREDICTIONS.md',
  'docs/domain/SOCIAL-PREDICTION.md',
  'docs/domain/FAN-VALUE-AND-LEADERBOARDS.md',
  'docs/domain/MEDIA-AND-CAMPAIGNS.md',
  'docs/domain/WALLET-AND-COMMERCE-BOUNDARIES.md',
  'docs/domain/BETA-LAUNCH.md',
  'docs/operations/ENVIRONMENT-STRATEGY.md',
  'docs/operations/RELEASE-PROCESS.md',
  'docs/operations/MIGRATION-OPERATIONS.md',
  'docs/operations/OBSERVABILITY-REQUIREMENTS.md',
  'docs/operations/INCIDENT-MANAGEMENT.md',
  'docs/operations/BACKUP-AND-RESTORE.md',
  'docs/operations/DISASTER-RECOVERY.md',
  'docs/operations/PRODUCTION-READINESS.md',
  'docs/reference/API-ROUTES.md',
  'docs/reference/FRONTEND-ROUTES.md',
  'docs/reference/DATABASE-MODELS.md',
  'docs/reference/MIGRATIONS.md',
  'docs/reference/FEATURE-FLAGS-AND-READINESS.md',
  'docs/reference/TEST-INVENTORY.md',
];
for (const file of REQUIRED_FILES) {
  if (fileExists(file)) {
    pass(`${file} exists`);
  } else {
    fail(`${file} is MISSING`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 9: CONTRIBUTING.md references ADR-026
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 9: CONTRIBUTING.md references ADR-026');
if (fileExists('CONTRIBUTING.md')) {
  const content = readFile('CONTRIBUTING.md');
  if (content.includes('ADR-026')) {
    pass('CONTRIBUTING.md references ADR-026');
  } else {
    fail('CONTRIBUTING.md does NOT reference ADR-026');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 10: No stale NEXT_PUBLIC_API_URL references in new docs (not platform/)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 10: No stale NEXT_PUBLIC_API_URL in new docs');
const STALE_ENV_VAR = 'NEXT_PUBLIC_API_URL';
const CORRECT_ENV_VAR = 'NEXT_PUBLIC_API_BASE_URL';
const newDocDirs = [
  'docs/architecture',
  'docs/engineering',
  'docs/domain',
  'docs/operations',
  'docs/reference',
  'docs/project',
];
let staleFound = false;
for (const dir of newDocDirs) {
  const fullDir = join(ROOT, dir);
  if (!existsSync(fullDir)) continue;
  const files = readdirSync(fullDir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const content = readFileSync(join(fullDir, file), 'utf8');
    if (content.includes(STALE_ENV_VAR) && !content.includes(CORRECT_ENV_VAR)) {
      fail(`${dir}/${file} contains stale '${STALE_ENV_VAR}' (should be '${CORRECT_ENV_VAR}')`);
      staleFound = true;
    }
  }
}
if (!staleFound) {
  pass(`No stale '${STALE_ENV_VAR}' references in new documentation`);
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 11: No encoding artefacts in reference docs and root docs
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 11: No encoding artefacts in reference docs');
const ENCODING_PATTERN = /[-�]|â€|Ã¢|Ã¯Â¿Â½/;
const refFiles = [
  'docs/reference/API-ROUTES.md',
  'docs/reference/FRONTEND-ROUTES.md',
  'docs/reference/DATABASE-MODELS.md',
  'docs/reference/MIGRATIONS.md',
  'docs/adr/README.md',
  'README.md',
  'CONTRIBUTING.md',
];
let encodingFound = false;
for (const rel of refFiles) {
  if (!fileExists(rel)) continue;
  const content = readFile(rel);
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (ENCODING_PATTERN.test(lines[i])) {
      fail(`${rel}:${i + 1} contains encoding artefact: ${lines[i].substring(0, 80)}`);
      encodingFound = true;
    }
  }
}
if (!encodingFound) {
  pass('No encoding artefacts found in reference docs');
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 12: No duplicate route rows in API-ROUTES.md
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 12: No duplicate route rows in API-ROUTES.md');
if (fileExists('docs/reference/API-ROUTES.md')) {
  const content = readFile('docs/reference/API-ROUTES.md');
  const routeRows = content.split('\n')
    .filter(l => /^\| (GET|POST|PATCH|PUT|DELETE)\s*\|/.test(l));
  const seen = new Map();
  let dupCount = 0;
  for (const row of routeRows) {
    const key = row.replace(/\s+/g, ' ').trim();
    if (seen.has(key)) {
      fail(`API-ROUTES.md duplicate route row: ${key.substring(0, 100)}`);
      dupCount++;
    } else {
      seen.set(key, true);
    }
  }
  if (dupCount === 0) {
    pass(`API-ROUTES.md: ${routeRows.length} route rows, 0 duplicates`);
  }
} else {
  fail('docs/reference/API-ROUTES.md is MISSING');
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 13: No duplicate route rows in FRONTEND-ROUTES.md
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 13: No duplicate route rows in FRONTEND-ROUTES.md');
if (fileExists('docs/reference/FRONTEND-ROUTES.md')) {
  const content = readFile('docs/reference/FRONTEND-ROUTES.md');
  const routeRows = content.split('\n')
    .filter(l => /^\| `\//.test(l));
  const seen = new Map();
  let dupCount = 0;
  for (const row of routeRows) {
    const key = row.replace(/\s+/g, ' ').trim();
    if (seen.has(key)) {
      fail(`FRONTEND-ROUTES.md duplicate route row: ${key.substring(0, 100)}`);
      dupCount++;
    } else {
      seen.set(key, true);
    }
  }
  if (dupCount === 0) {
    pass(`FRONTEND-ROUTES.md: ${routeRows.length} route rows, 0 duplicates`);
  }
} else {
  fail('docs/reference/FRONTEND-ROUTES.md is MISSING');
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 14: No malformed table rows in API-ROUTES.md route tables
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 14: No malformed route table rows in API-ROUTES.md');
if (fileExists('docs/reference/API-ROUTES.md')) {
  const content = readFile('docs/reference/API-ROUTES.md');
  const lines = content.split('\n');
  let malformedCount = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Route rows must start with Method and have at least 5 pipes (6 cells)
    if (/^\| (GET|POST|PATCH|PUT|DELETE)\s*\|/.test(line)) {
      const pipes = (line.match(/\|/g) || []).length;
      if (pipes < 5) {
        fail(`API-ROUTES.md:${i + 1} malformed route row (${pipes} pipes): ${line.substring(0, 80)}`);
        malformedCount++;
      }
    }
    // Truncated row patterns
    if (/^\| (GET|POST|PATCH|PUT|DELETE|PA|G|P)\s*$/.test(line)) {
      fail(`API-ROUTES.md:${i + 1} truncated/incomplete row: ${line}`);
      malformedCount++;
    }
  }
  if (malformedCount === 0) {
    pass('API-ROUTES.md: no malformed route table rows');
  }
} else {
  fail('docs/reference/API-ROUTES.md is MISSING');
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 15: No duplicate headings in reference docs
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 15: No duplicate headings in reference docs');
const headingCheckFiles = [
  'docs/reference/API-ROUTES.md',
  'docs/reference/FRONTEND-ROUTES.md',
  'docs/reference/DATABASE-MODELS.md',
];
for (const rel of headingCheckFiles) {
  if (!fileExists(rel)) continue;
  const content = readFile(rel);
  const headings = content.split('\n').filter(l => /^#{1,3} /.test(l));
  const seen = new Map();
  let dupFound = false;
  for (const h of headings) {
    if (seen.has(h)) {
      fail(`${rel} has duplicate heading: ${h}`);
      dupFound = true;
    } else {
      seen.set(h, true);
    }
  }
  if (!dupFound) {
    pass(`${rel}: no duplicate headings`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 16: No stale four-digit ADR references (ADR-0001, ADR-0002 etc.)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 16: No stale four-digit ADR references');
const adrCheckFiles = [
  'README.md',
  'CONTRIBUTING.md',
  'docs/README.md',
  'docs/adr/README.md',
];
const FOUR_DIGIT_ADR = /ADR-0\d{3}/;
let fourDigitFound = false;
for (const rel of adrCheckFiles) {
  if (!fileExists(rel)) continue;
  const content = readFile(rel);
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (FOUR_DIGIT_ADR.test(lines[i])) {
      fail(`${rel}:${i + 1} contains stale four-digit ADR reference: ${lines[i].substring(0, 80)}`);
      fourDigitFound = true;
    }
  }
}
if (!fourDigitFound) {
  pass('No stale four-digit ADR references found');
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 17: No duplicate model entries in DATABASE-MODELS.md
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 17: No duplicate model entries in DATABASE-MODELS.md');
if (fileExists('docs/reference/DATABASE-MODELS.md')) {
  const content = readFile('docs/reference/DATABASE-MODELS.md');
  // Extract model names from table rows like | `ModelName` |
  const modelRows = content.split('\n')
    .filter(l => /^\| `[A-Z][A-Za-z]+`/.test(l))
    .map(l => {
      const m = l.match(/^\| `([A-Z][A-Za-z]+)`/);
      return m ? m[1] : null;
    })
    .filter(Boolean);
  const seen = new Map();
  let dupCount = 0;
  for (const name of modelRows) {
    if (seen.has(name)) {
      fail(`DATABASE-MODELS.md has duplicate model entry: ${name}`);
      dupCount++;
    } else {
      seen.set(name, true);
    }
  }
  if (dupCount === 0) {
    pass(`DATABASE-MODELS.md: ${modelRows.length} model entries, 0 duplicates`);
  }
} else {
  fail('docs/reference/DATABASE-MODELS.md is MISSING');
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 18: Declared model count matches unique model rows in DATABASE-MODELS.md
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n■ Check 18: DATABASE-MODELS.md declared count matches unique row count');
if (fileExists('docs/reference/DATABASE-MODELS.md') && existsSync(schemaPath)) {
  const content = readFile('docs/reference/DATABASE-MODELS.md');
  const schema = readFileSync(schemaPath, 'utf8');
  const actualModelCount = countLines(schema, /^model /);
  const modelRows = content.split('\n')
    .filter(l => /^\| `[A-Z][A-Za-z]+`/.test(l))
    .map(l => {
      const m = l.match(/^\| `([A-Z][A-Za-z]+)`/);
      return m ? m[1] : null;
    })
    .filter(Boolean);
  const uniqueCount = new Set(modelRows).size;
  if (uniqueCount === actualModelCount) {
    pass(`DATABASE-MODELS.md unique rows (${uniqueCount}) matches schema model count (${actualModelCount})`);
  } else {
    fail(`DATABASE-MODELS.md has ${uniqueCount} unique model rows but schema has ${actualModelCount} models`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(60));
if (failures === 0 && warnings === 0) {
  console.log(`\n✅  All checks passed.\n`);
} else if (failures === 0) {
  console.log(`\n⚠️   All checks passed with ${warnings} warning(s).\n`);
} else {
  console.log(`\n❌  ${failures} check(s) FAILED, ${warnings} warning(s).\n`);
  process.exit(1);
}
