/**
 * Sprint 26 — Role Route Smoke Test
 *
 * Tests role-based route access for PSL_ADMIN, CLUB_ADMIN, SPONSOR_ADMIN, FAN personas.
 *
 * Rules:
 * - Never print token values — tokens are used only in Authorization headers
 * - If token missing, mark persona smoke as PENDING_TOKEN (not a failure)
 * - No writes, no PSL activation, no fixture import
 * - No real-money functionality
 * - All requests are GET (read-only)
 *
 * Usage:
 *   BASE_URL=https://staging.psl-one.app \
 *   PSL_ADMIN_TOKEN=<jwt> \
 *   CLUB_ADMIN_TOKEN=<jwt> \
 *   SPONSOR_ADMIN_TOKEN=<jwt> \
 *   FAN_TOKEN=<jwt> \
 *   node sprint-26-role-route-smoke.mjs
 *
 * Safety:
 *   PSL_INACTIVE - does not activate PSL
 *   WALLET_SANDBOX_ONLY - does not change wallet mode
 *   NO_WRITES - all requests are GET (read-only)
 *   NO_FIXTURE_IMPORT - does not import fixtures
 *   NO_PSL_ACTIVATION - does not activate PSL season
 *   TOKENS_NEVER_PRINTED - token values are never logged
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

// ── Token presence check — NEVER print token values ───────────────────────

function hasToken(envVar) {
  const val = process.env[envVar];
  return !!(val && val.length > 10);
}

function authHeader(envVar) {
  const val = process.env[envVar];
  if (!val) return {};
  return { Authorization: `Bearer ${val}` };
  // NOTE: token value is NEVER logged or printed
}

// ── Route definitions per persona ─────────────────────────────────────────

const ADMIN_API_ROUTES = [
  { path: '/auth/me',           method: 'GET', expectedStatus: 200, description: 'Auth check'          },
  { path: '/admin/competitions',method: 'GET', expectedStatus: 200, description: 'List competitions'   },
  { path: '/admin/seasons',     method: 'GET', expectedStatus: 200, description: 'List seasons'        },
  { path: '/admin/fixtures',    method: 'GET', expectedStatus: 200, description: 'List fixtures'       },
  { path: '/admin/users',       method: 'GET', expectedStatus: 200, description: 'List users'          },
  { path: '/admin/audit',       method: 'GET', expectedStatus: 200, description: 'Audit log'           },
  { path: '/admin/roles',       method: 'GET', expectedStatus: 200, description: 'Roles list'          },
  { path: '/admin/readiness',   method: 'GET', expectedStatus: 200, description: 'Readiness check'     },
];

// Safety: fixture import write must return 403 (not run)
const ADMIN_GATED_ROUTES = [
  { path: '/admin/fixtures/import-write', method: 'GET', expectedStatus: 403, description: 'Fixture write (must be 403)' },
];

const CLUB_API_ROUTES = [
  { path: '/auth/me',           method: 'GET', expectedStatus: 200, description: 'Auth check'          },
  { path: '/club/overview',     method: 'GET', expectedStatus: 200, description: 'Club overview'       },
  { path: '/club/profile',      method: 'GET', expectedStatus: 200, description: 'Club profile'        },
  { path: '/club/squad',        method: 'GET', expectedStatus: 200, description: 'Club squad'          },
  { path: '/club/fixtures',     method: 'GET', expectedStatus: 200, description: 'Club fixtures'       },
  { path: '/club/fans',         method: 'GET', expectedStatus: [200, 404], description: 'Club fans (API_PENDING ok)'  },
  { path: '/club/analytics',    method: 'GET', expectedStatus: [200, 404], description: 'Club analytics (API_PENDING ok)' },
  { path: '/club/content',      method: 'GET', expectedStatus: [200, 404], description: 'Club content (API_PENDING ok)'  },
];

// Club admin must NOT access admin routes
const CLUB_BLOCKED_ROUTES = [
  { path: '/admin/users',       method: 'GET', expectedStatus: 403, description: 'Admin block (must be 403)' },
  { path: '/sponsor/overview',  method: 'GET', expectedStatus: 403, description: 'Sponsor block (must be 403)' },
];

const SPONSOR_API_ROUTES = [
  { path: '/auth/me',               method: 'GET', expectedStatus: 200, description: 'Auth check'             },
  { path: '/sponsor/overview',      method: 'GET', expectedStatus: 200, description: 'Sponsor overview'       },
  { path: '/sponsor/profile',       method: 'GET', expectedStatus: 200, description: 'Sponsor profile'        },
  { path: '/sponsor/campaigns',     method: 'GET', expectedStatus: [200, 404], description: 'Campaigns (API_PENDING ok)' },
  { path: '/sponsor/rewards',       method: 'GET', expectedStatus: [200, 404], description: 'Rewards (API_PENDING ok)'   },
  { path: '/sponsor/audiences',     method: 'GET', expectedStatus: [200, 404], description: 'Audiences (API_PENDING ok)' },
  { path: '/sponsor/analytics',     method: 'GET', expectedStatus: [200, 404], description: 'Analytics (API_PENDING ok)' },
];

// Sponsor admin must NOT access admin routes
const SPONSOR_BLOCKED_ROUTES = [
  { path: '/admin/users',       method: 'GET', expectedStatus: 403, description: 'Admin block (must be 403)' },
  { path: '/club/overview',     method: 'GET', expectedStatus: 403, description: 'Club block (must be 403)'  },
];

const FAN_API_ROUTES = [
  { path: '/auth/me',           method: 'GET', expectedStatus: 200, description: 'Auth check'          },
  { path: '/fixtures',          method: 'GET', expectedStatus: 200, description: 'Browse fixtures'     },
  { path: '/predictions',       method: 'GET', expectedStatus: 200, description: 'Fan predictions'     },
];

// Fan must NOT access admin routes
const FAN_BLOCKED_ROUTES = [
  { path: '/admin/users',       method: 'GET', expectedStatus: 403, description: 'Admin block (must be 403)' },
];

// ── Smoke runner ──────────────────────────────────────────────────────────

async function runSmoke(personaName, tokenEnvVar, accessRoutes, blockedRoutes = []) {
  const tokenPresent = hasToken(tokenEnvVar);

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Persona: ${personaName}`);

  if (!tokenPresent) {
    console.log(`Status:  PENDING_TOKEN — ${tokenEnvVar} not set`);
    console.log(`         Set ${tokenEnvVar}=<jwt> to run this persona smoke.`);
    console.log(`         Token value is NEVER printed.`);
    return { persona: personaName, status: 'PENDING_TOKEN', pass: 0, fail: 0 };
  }

  console.log(`Status:  Running... (token present — value not printed)`);
  console.log(`${'─'.repeat(60)}`);

  const headers = authHeader(tokenEnvVar);
  let pass = 0;
  let fail = 0;

  // Access routes
  for (const route of accessRoutes) {
    try {
      const res = await fetch(BASE_URL + route.path, {
        method: route.method,
        headers: { ...headers, 'Accept': 'application/json' },
        redirect: 'follow',
      });

      const expected = Array.isArray(route.expectedStatus)
        ? route.expectedStatus
        : [route.expectedStatus];

      const ok = expected.includes(res.status);
      const icon = ok ? '✓' : '✗';

      console.log(
        `${icon} ${route.method.padEnd(5)} ${route.path.padEnd(36)} ${res.status}` +
        (ok ? '' : `  (expected ${expected.join(' or ')})`)
      );

      if (ok) pass++;
      else fail++;
    } catch (e) {
      console.log(`✗ ${route.method.padEnd(5)} ${route.path.padEnd(36)} ERROR: ${e.message}`);
      fail++;
    }
  }

  // Blocked routes (must return 403)
  for (const route of blockedRoutes) {
    try {
      const res = await fetch(BASE_URL + route.path, {
        method: route.method,
        headers: { ...headers, 'Accept': 'application/json' },
        redirect: 'follow',
      });

      const expected = Array.isArray(route.expectedStatus)
        ? route.expectedStatus
        : [route.expectedStatus];

      const ok = expected.includes(res.status);
      const icon = ok ? '✓' : '✗';

      console.log(
        `${icon} BLOCK  ${route.path.padEnd(36)} ${res.status}` +
        (ok ? '' : `  (expected ${expected.join(' or ')}) — RBAC failure!`)
      );

      if (ok) pass++;
      else fail++;
    } catch (e) {
      console.log(`✗ BLOCK  ${route.path.padEnd(36)} ERROR: ${e.message}`);
      fail++;
    }
  }

  const total = pass + fail;
  const status = fail === 0 ? 'PASS' : 'FAIL';
  console.log(`\n${personaName}: ${pass}/${total} PASS — ${status}`);
  return { persona: personaName, status, pass, fail };
}

// ── Main ───────────────────────────────────────────────────────────────────

console.log(`\nSprint 26 — Role Route Smoke Test`);
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`\nPersona token status:`);
console.log(`  PSL_ADMIN_TOKEN:    ${hasToken('PSL_ADMIN_TOKEN')    ? 'PRESENT (value not printed)' : 'NOT SET — PENDING_TOKEN'}`);
console.log(`  CLUB_ADMIN_TOKEN:   ${hasToken('CLUB_ADMIN_TOKEN')   ? 'PRESENT (value not printed)' : 'NOT SET — PENDING_TOKEN'}`);
console.log(`  SPONSOR_ADMIN_TOKEN:${hasToken('SPONSOR_ADMIN_TOKEN')? 'PRESENT (value not printed)' : 'NOT SET — PENDING_TOKEN'}`);
console.log(`  FAN_TOKEN:          ${hasToken('FAN_TOKEN')          ? 'PRESENT (value not printed)' : 'NOT SET — PENDING_TOKEN'}`);

const results = [];

results.push(await runSmoke(
  'PSL_ADMIN',
  'PSL_ADMIN_TOKEN',
  [...ADMIN_API_ROUTES, ...ADMIN_GATED_ROUTES],
));

results.push(await runSmoke(
  'CLUB_ADMIN',
  'CLUB_ADMIN_TOKEN',
  CLUB_API_ROUTES,
  CLUB_BLOCKED_ROUTES,
));

results.push(await runSmoke(
  'SPONSOR_ADMIN',
  'SPONSOR_ADMIN_TOKEN',
  SPONSOR_API_ROUTES,
  SPONSOR_BLOCKED_ROUTES,
));

results.push(await runSmoke(
  'FAN',
  'FAN_TOKEN',
  FAN_API_ROUTES,
  FAN_BLOCKED_ROUTES,
));

// ── Final summary ──────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(60)}`);
console.log(`SPRINT 26 — ROLE ROUTE SMOKE SUMMARY`);
console.log(`${'═'.repeat(60)}`);

let totalFail = 0;
for (const r of results) {
  const statusPad = r.status.padEnd(14);
  if (r.status === 'PENDING_TOKEN') {
    console.log(`  ${r.persona.padEnd(20)} ${statusPad} (owner gate — token not provisioned)`);
  } else {
    console.log(`  ${r.persona.padEnd(20)} ${statusPad} ${r.pass}/${r.pass + r.fail}`);
    if (r.fail > 0) totalFail += r.fail;
  }
}

console.log(`\nSafety confirmations:`);
console.log(`  PSL remains inactive — no activation performed`);
console.log(`  Wallet remains sandbox-only — not changed`);
console.log(`  No writes performed — all requests were GET`);
console.log(`  No fixture import performed`);
console.log(`  Token values were never printed`);

if (totalFail > 0) {
  console.log(`\nRESULT: FAIL — ${totalFail} RBAC failure(s) detected`);
  process.exit(1);
} else {
  console.log(`\nRESULT: PASS (or PENDING_TOKEN for untested personas)`);
  process.exit(0);
}
