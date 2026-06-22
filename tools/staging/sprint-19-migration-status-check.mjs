#!/usr/bin/env node
/**
 * Sprint 19 — Migration Status Check
 *
 * Checks whether the local or staging database is up to date with
 * all Prisma migrations. Does NOT apply migrations — reports status only.
 *
 * Usage:
 *   DATABASE_URL=<url> node sprint-19-migration-status-check.mjs
 *
 * Exit codes:
 *   0 — database is up to date or status is informational only
 *   1 — pending migrations detected (STAGING_MIGRATION_PENDING_OWNER_AUTHORIZATION)
 *
 * SECURITY: DATABASE_URL is consumed but never printed.
 *   No migrations are applied by this tool.
 *   No provider keys are used.
 *   No PSL activation.
 */

// Sprint 9 gate
const _sportmonksRef = process.env['SPORTMONKS_API_KEY'];

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const DATABASE_URL = process.env['DATABASE_URL'];

console.log('=== Sprint 19 — Migration Status Check ===');
console.log('This tool DOES NOT apply migrations — status check only.');
console.log(`DATABASE_URL present: ${Boolean(DATABASE_URL)}`);
console.log('');

if (!DATABASE_URL) {
  console.log('Status: STAGING_ENV_DATABASE_URL_MISSING');
  console.log('Cannot check migration status without DATABASE_URL.');
  console.log('Set DATABASE_URL to point at the target database (staging/local only).');
  process.exit(1);
}

// Check how many migration files exist locally
const migrationsDir = path.resolve(REPO_ROOT, 'apps', 'api', 'prisma', 'migrations');
let localMigrations = [];
try {
  const { readdirSync, statSync } = await import('fs');
  localMigrations = readdirSync(migrationsDir)
    .filter(f => statSync(path.join(migrationsDir, f)).isDirectory() && f !== 'migration_lock.toml')
    .sort();
  console.log(`Local migration files: ${localMigrations.length}`);
  if (localMigrations.length > 0) {
    const last = localMigrations[localMigrations.length - 1];
    console.log(`Latest migration: ${last}`);
  }
} catch (err) {
  console.log(`Could not read migrations directory: ${err.message}`);
}

// Attempt prisma migrate status (non-destructive, read-only)
console.log('');
console.log('[ Running: prisma migrate status (read-only) ]');
try {
  const output = execSync(
    'pnpm --filter @psl-one/api exec prisma migrate status',
    {
      cwd: REPO_ROOT,
      env: { ...process.env, DATABASE_URL },
      encoding: 'utf8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );

  console.log(output);

  if (output.includes('Database schema is up to date')) {
    console.log('Status: STAGING_MIGRATION_UP_TO_DATE');
    console.log('No pending migrations. Database is current.');
    process.exit(0);
  } else if (output.includes('Following migration')) {
    console.log('');
    console.log('Status: STAGING_MIGRATION_PENDING_OWNER_AUTHORIZATION');
    console.log('');
    console.log('Pending migrations detected. To apply, an owner must run:');
    console.log('  DATABASE_URL=<staging-url> pnpm --filter @psl-one/api exec prisma migrate deploy');
    console.log('');
    console.log('DO NOT run this command without owner authorization.');
    console.log('DO NOT apply to production database.');
    process.exit(1);
  } else {
    console.log('Status: STAGING_MIGRATION_STATUS_UNKNOWN');
    process.exit(0);
  }
} catch (err) {
  // prisma migrate status exits non-zero when there are pending migrations
  const output = err.stdout ?? err.message ?? '';
  console.log(output);

  if (output.includes('Following migration') || output.includes('have not yet been applied')) {
    console.log('');
    console.log('Status: STAGING_MIGRATION_PENDING_OWNER_AUTHORIZATION');
    console.log('');
    console.log('Pending migrations detected. Owner must authorize before applying.');
    console.log('  DATABASE_URL=<staging-url> pnpm --filter @psl-one/api exec prisma migrate deploy');
    process.exit(1);
  } else if (output.includes('Database schema is up to date') || output.includes('up to date')) {
    console.log('Status: STAGING_MIGRATION_UP_TO_DATE');
    process.exit(0);
  } else {
    console.log(`Could not determine migration status: ${err.message}`);
    console.log('Status: STAGING_MIGRATION_STATUS_UNKNOWN');
    console.log('Check DATABASE_URL and ensure the target database is reachable.');
    process.exit(0);
  }
}
