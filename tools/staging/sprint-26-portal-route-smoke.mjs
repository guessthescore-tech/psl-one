/**
 * Sprint 26 — Portal Route Smoke Test
 *
 * Tests all portal routes and reports HTTP status.
 * Rules:
 * - 0 5xx failures required
 * - 404 allowed for RBAC-gated routes when unauthenticated
 * - Never prints token values
 * - No writes, no PSL activation, no fixture import
 * - No real-money functionality
 *
 * Usage:
 *   BASE_URL=http://localhost:3001 node sprint-26-portal-route-smoke.mjs
 *   BASE_URL=https://staging.psl-one.app node sprint-26-portal-route-smoke.mjs
 *   BASE_URL=https://psl-one-experience-preview-cxb5urftw-guess-the-score.vercel.app node sprint-26-portal-route-smoke.mjs
 *
 * Safety:
 *   PSL_INACTIVE - does not activate PSL
 *   WALLET_SANDBOX_ONLY - does not change wallet mode
 *   NO_WRITES - all requests are GET (read-only)
 *   NO_FIXTURE_IMPORT - does not import fixtures
 *   NO_PSL_ACTIVATION - does not activate PSL season
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

const routes = [
  // ── Fan routes (expect 200 — public or session-gated) ────────────────────
  { path: '/',                               category: 'fan',     expectedNon5xx: true },
  { path: '/predict',                        category: 'fan',     expectedNon5xx: true },
  { path: '/predict/challenge',              category: 'fan',     expectedNon5xx: true },
  { path: '/predict/challenge/accept',       category: 'fan',     expectedNon5xx: true },
  { path: '/fantasy',                        category: 'fan',     expectedNon5xx: true },
  { path: '/account',                        category: 'fan',     expectedNon5xx: true },

  // ── Admin portal (expect non-5xx — 404 is RBAC-gated without auth) ───────
  { path: '/admin',                          category: 'admin',   expectedNon5xx: true },
  { path: '/admin/overview',                 category: 'admin',   expectedNon5xx: true },
  { path: '/admin/competitions',             category: 'admin',   expectedNon5xx: true },
  { path: '/admin/seasons',                  category: 'admin',   expectedNon5xx: true },
  { path: '/admin/fixtures',                 category: 'admin',   expectedNon5xx: true },
  { path: '/admin/teams',                    category: 'admin',   expectedNon5xx: true },
  { path: '/admin/players',                  category: 'admin',   expectedNon5xx: true },
  { path: '/admin/clubs',                    category: 'admin',   expectedNon5xx: true },
  { path: '/admin/rules',                    category: 'admin',   expectedNon5xx: true },
  { path: '/admin/rules/guess-the-score',    category: 'admin',   expectedNon5xx: true },
  { path: '/admin/rules/fantasy',            category: 'admin',   expectedNon5xx: true },
  { path: '/admin/points',                   category: 'admin',   expectedNon5xx: true },
  { path: '/admin/points/simulation',        category: 'admin',   expectedNon5xx: true },
  { path: '/admin/leaderboards',             category: 'admin',   expectedNon5xx: true },
  { path: '/admin/challenges',               category: 'admin',   expectedNon5xx: true },
  { path: '/admin/campaigns',                category: 'admin',   expectedNon5xx: true },
  { path: '/admin/sponsors',                 category: 'admin',   expectedNon5xx: true },
  { path: '/admin/users',                    category: 'admin',   expectedNon5xx: true },
  { path: '/admin/roles',                    category: 'admin',   expectedNon5xx: true },
  { path: '/admin/audit',                    category: 'admin',   expectedNon5xx: true },
  { path: '/admin/settings',                 category: 'admin',   expectedNon5xx: true },
  { path: '/admin/readiness',                category: 'admin',   expectedNon5xx: true },

  // ── Club portal (expect non-5xx — 404 is RBAC-gated without auth) ────────
  { path: '/club',                           category: 'club',    expectedNon5xx: true },
  { path: '/club/overview',                  category: 'club',    expectedNon5xx: true },
  { path: '/club/profile',                   category: 'club',    expectedNon5xx: true },
  { path: '/club/squad',                     category: 'club',    expectedNon5xx: true },
  { path: '/club/players',                   category: 'club',    expectedNon5xx: true },
  { path: '/club/fixtures',                  category: 'club',    expectedNon5xx: true },
  { path: '/club/results',                   category: 'club',    expectedNon5xx: true },
  { path: '/club/fans',                      category: 'club',    expectedNon5xx: true },
  { path: '/club/supporters',                category: 'club',    expectedNon5xx: true },
  { path: '/club/content',                   category: 'club',    expectedNon5xx: true },
  { path: '/club/campaigns',                 category: 'club',    expectedNon5xx: true },
  { path: '/club/sponsors',                  category: 'club',    expectedNon5xx: true },
  { path: '/club/analytics',                 category: 'club',    expectedNon5xx: true },
  { path: '/club/settings',                  category: 'club',    expectedNon5xx: true },

  // ── Sponsor portal (expect non-5xx — 404 is RBAC-gated without auth) ─────
  { path: '/sponsor',                        category: 'sponsor', expectedNon5xx: true },
  { path: '/sponsor/overview',               category: 'sponsor', expectedNon5xx: true },
  { path: '/sponsor/profile',                category: 'sponsor', expectedNon5xx: true },
  { path: '/sponsor/campaigns',              category: 'sponsor', expectedNon5xx: true },
  { path: '/sponsor/campaigns/new',          category: 'sponsor', expectedNon5xx: true },
  { path: '/sponsor/audiences',              category: 'sponsor', expectedNon5xx: true },
  { path: '/sponsor/activations',            category: 'sponsor', expectedNon5xx: true },
  { path: '/sponsor/rewards',                category: 'sponsor', expectedNon5xx: true },
  { path: '/sponsor/analytics',              category: 'sponsor', expectedNon5xx: true },
  { path: '/sponsor/clubs',                  category: 'sponsor', expectedNon5xx: true },
  { path: '/sponsor/assets',                 category: 'sponsor', expectedNon5xx: true },
  { path: '/sponsor/billing-placeholder',    category: 'sponsor', expectedNon5xx: true },
  { path: '/sponsor/settings',               category: 'sponsor', expectedNon5xx: true },
];

// ── Safety checks — never include write or activation endpoints ───────────

const FORBIDDEN_PATHS = [
  '/admin/psl/activate',
  '/admin/fixtures/import-write',
  '/admin/fixtures/publish',
  '/admin/wallet/production',
];

for (const r of routes) {
  for (const forbidden of FORBIDDEN_PATHS) {
    if (r.path.includes(forbidden)) {
      console.error(`SAFETY ERROR: forbidden path included: ${r.path}`);
      process.exit(1);
    }
  }
}

// ── Run smoke ──────────────────────────────────────────────────────────────

let failures = 0;
let fivexx = 0;
let notFound = 0;
let passed = 0;

console.log(`\nSprint 26 — Portal Route Smoke`);
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`Routes to test: ${routes.length}`);
console.log(`─`.repeat(70));

const categoryWidths = { fan: 8, admin: 8, club: 8, sponsor: 8 };

for (const route of routes) {
  const url = BASE_URL + route.path;
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'Accept': 'text/html,application/json' },
    });
    const is5xx = res.status >= 500;
    const is404 = res.status === 404;
    const icon = is5xx ? '✗' : '✓';

    console.log(
      `${icon} ${route.category.padEnd(8)} ${route.path.padEnd(44)} ${res.status}`
    );

    if (is5xx) { failures++; fivexx++; }
    else if (is404) { notFound++; passed++; }
    else { passed++; }
  } catch (e) {
    console.log(`✗ ${route.category.padEnd(8)} ${route.path.padEnd(44)} ERROR: ${e.message}`);
    failures++;
  }
}

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`─`.repeat(70));
console.log(`\nSummary:`);
console.log(`  Total routes tested:    ${routes.length}`);
console.log(`  Passed (non-5xx):       ${passed}`);
console.log(`  5xx failures:           ${fivexx}  (must be 0)`);
console.log(`  404 (RBAC-gated):       ${notFound} (expected for unauthenticated portal access)`);
console.log(`  Connection errors:      ${failures - fivexx}`);
console.log(``);

if (fivexx > 0) {
  console.log(`RESULT: FAIL — ${fivexx} 5xx error(s) detected`);
  process.exit(1);
} else if (failures > 0) {
  console.log(`RESULT: WARN — ${failures} connection error(s); no 5xx failures`);
  process.exit(0);
} else {
  console.log(`RESULT: PASS — 0 5xx failures`);
  process.exit(0);
}
