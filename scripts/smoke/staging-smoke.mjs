#!/usr/bin/env node
//
// Smoke test suite for PSL One staging and beta environments.
//
// Modes:
//   SMOKE_ENVIRONMENT=staging (default)
//     STAGING_API_BASE_URL  — required
//     STAGING_WEB_BASE_URL  — required
//     Environment label checked: "staging"
//
//   SMOKE_ENVIRONMENT=beta
//     BETA_API_BASE_URL     — required
//     BETA_WEB_BASE_URL     — required
//     SMOKE_EC2_IP          — optional; when set, requests go to this IP with Host header
//                             (Mode A: EC2 IP + /etc/hosts bypass)
//     Environment label checked: "beta"
//
// All checks are read-only. No mutations, logins, or provider calls.
// Exits 1 if any check fails; machine-readable JSON summary on stdout.

const smokeEnv = process.env.SMOKE_ENVIRONMENT ?? 'staging';
const isBeta = smokeEnv === 'beta';
const ec2Ip = process.env.SMOKE_EC2_IP ?? null;
const expectedSha = process.env.EXPECTED_SHA ?? null;

let apiBaseUrl, webBaseUrl;
if (isBeta) {
  apiBaseUrl = requiredUrl('BETA_API_BASE_URL');
  webBaseUrl = requiredUrl('BETA_WEB_BASE_URL');
} else {
  apiBaseUrl = requiredUrl('STAGING_API_BASE_URL');
  webBaseUrl = requiredUrl('STAGING_WEB_BASE_URL');
}

const expectedEnvLabel = isBeta ? 'beta' : 'staging';

const checks = isBeta
  ? [
      ['api liveness',                   () => expectJson(`${apiBaseUrl}/health`,         { ok: (b) => b.status === 'ok' && b.service === 'api' })],
      ['api readiness',                  () => expectJson(`${apiBaseUrl}/health/ready`,   { ok: (b) => b.status === 'ready' && b.checks?.database === 'ok' })],
      ['api version sha',                checkApiVersionSha],
      ['web health',                     () => expectJson(`${webBaseUrl}/api/health`,     { ok: (b) => b.status === 'ok' && b.service === 'web' })],
      ['web landing',                    () => expectHtml(`${webBaseUrl}/`, ['PSL One'])],
      ['beta environment label',         checkEnvironmentLabel],
      ['world cup season preserved',     checkWorldCupPreserved],
      ['psl season exists and inactive', checkPslSeasonInactive],
      ['psl activation not ACTIVATED',   checkPslNotActivated],
      ['fixtures',                       () => expectJson(`${apiBaseUrl}/football/fixtures?limit=1`)],
      ['standings',                      () => expectJson(`${apiBaseUrl}/football/standings`)],
      ['match centre',                   () => expectHtml(`${webBaseUrl}/matches`, ['Match'])],
      ['fantasy landing',                () => expectHtml(`${webBaseUrl}/fantasy`, ['Fantasy'])],
      ['guess the score landing',        () => expectHtml(`${webBaseUrl}/predictions`, ['Predict'])],
      ['social prediction landing',      () => expectHtml(`${webBaseUrl}/social-challenges`, ['Challenge'])],
      ['leaderboards',                   () => expectHtml(`${webBaseUrl}/leaderboards`, ['Leaderboard'])],
      ['unauthenticated admin rejection', () => expectStatus(`${apiBaseUrl}/seasons/admin/context`, [401, 403])],
    ]
  : [
      ['api liveness',                    () => expectJson(`${apiBaseUrl}/health`,         { ok: (b) => b.status === 'ok' && b.service === 'api' })],
      ['api readiness',                   () => expectJson(`${apiBaseUrl}/health/ready`,   { ok: (b) => b.status === 'ready' && b.checks?.database === 'ok' })],
      ['api version',                     () => expectJson(`${apiBaseUrl}/version`,        { ok: (b) => typeof b.gitSha === 'string' && b.gitSha !== '' })],
      ['web health',                      () => expectJson(`${webBaseUrl}/api/health`,     { ok: (b) => b.status === 'ok' && b.service === 'web' })],
      ['web landing',                     () => expectHtml(`${webBaseUrl}/`, ['PSL One'])],
      ['active season exists',            checkActiveSeason],
      ['world cup season is historical',  checkWorldCupHistorical],
      ['psl season exists and inactive',  checkPslSeasonInactive],
      ['psl activation not ACTIVATED',    checkPslNotActivated],
      ['fixtures',                        () => expectJson(`${apiBaseUrl}/football/fixtures?limit=1`)],
      ['standings',                       () => expectJson(`${apiBaseUrl}/football/standings`)],
      ['match centre',                    () => expectHtml(`${webBaseUrl}/matches`, ['Match'])],
      ['fantasy landing',                 () => expectHtml(`${webBaseUrl}/fantasy`, ['Fantasy'])],
      ['guess the score landing',         () => expectHtml(`${webBaseUrl}/predictions`, ['Predict'])],
      ['social prediction landing',       () => expectHtml(`${webBaseUrl}/social-challenges`, ['Challenge'])],
      ['leaderboards',                    () => expectHtml(`${webBaseUrl}/leaderboards`, ['Leaderboard'])],
      ['unauthenticated admin rejection', () => expectStatus(`${apiBaseUrl}/seasons/admin/context`, [401, 403])],
      ['staging environment label',       checkEnvironmentLabel],
    ];

// ── Check implementations ─────────────────────────────────────────────────────

async function checkApiVersionSha() {
  const body = await expectJson(`${apiBaseUrl}/version`);
  const actualSha = body.gitSha;
  if (!actualSha || actualSha === '' || actualSha === 'unknown') {
    const err = new Error(`/version returned empty or missing gitSha: "${actualSha}"`);
    err.actualSha = actualSha;
    err.expectedSha = expectedSha;
    throw err;
  }
  if (expectedSha && actualSha !== expectedSha) {
    const err = new Error(
      `SHA mismatch: expected "${expectedSha}", deployed "${actualSha}"`,
    );
    err.actualSha = actualSha;
    err.expectedSha = expectedSha;
    throw err;
  }
  return { actualSha, expectedSha };
}

async function checkActiveSeason() {
  const body = await expectJson(`${apiBaseUrl}/football/seasons/active`);
  if (!body || !body.id) {
    throw new Error(`/football/seasons/active did not return a season with an id`);
  }
  if (body.isActive === false) {
    throw new Error(`Active season endpoint returned a season with isActive=false`);
  }
  return body;
}

async function checkWorldCupHistorical() {
  const body = await expectJson(`${apiBaseUrl}/football/seasons`);
  const seasons = Array.isArray(body) ? body : body.data ?? body.seasons ?? [];
  const wc = seasons.find((s) => s.name && s.name.includes('World Cup'));
  if (!wc) {
    throw new Error(`No World Cup season found in /football/seasons`);
  }
  if (wc.isActive === true) {
    throw new Error(`World Cup season must not be active alongside PSL season`);
  }
}

async function checkWorldCupPreserved() {
  // In beta, the World Cup season should still exist (not accidentally deleted or corrupted).
  // We do not assert whether it is active — that depends on the beta seeding state.
  const body = await expectJson(`${apiBaseUrl}/football/seasons`);
  const seasons = Array.isArray(body) ? body : body.data ?? body.seasons ?? [];
  const wc = seasons.find((s) => s.name && s.name.includes('World Cup'));
  if (!wc) {
    throw new Error(`World Cup season is missing from /football/seasons — expected to be preserved in beta`);
  }
}

async function checkPslSeasonInactive() {
  const body = await expectJson(`${apiBaseUrl}/football/seasons`);
  const seasons = Array.isArray(body) ? body : body.data ?? body.seasons ?? [];
  const psl = seasons.find((s) => s.name && s.name.includes('PSL'));
  if (!psl) {
    throw new Error(`No PSL season found in /football/seasons`);
  }
  if (psl.isActive === true) {
    throw new Error(`PSL season must not be active yet; found isActive=true`);
  }
}

async function checkPslNotActivated() {
  const response = await fetchWithTimeout(`${apiBaseUrl}/admin/beta-launch/season-activation-approvals`);
  if (response.status === 401 || response.status === 403) {
    return;
  }
  if (!response.ok) {
    throw new Error(`/admin/beta-launch/season-activation-approvals returned unexpected status ${response.status}`);
  }
  const body = await response.json();
  const approvals = Array.isArray(body) ? body : body.data ?? [];
  const activated = approvals.find((a) => a.approvalStatus === 'ACTIVATED');
  if (activated) {
    throw new Error(`PSL season must not be ACTIVATED in ${smokeEnv}; found ACTIVATED approval record`);
  }
}

async function checkEnvironmentLabel() {
  const apiHealth = await expectJson(`${apiBaseUrl}/health`);
  const webHealth = await expectJson(`${webBaseUrl}/api/health`);
  const apiEnv = apiHealth.environment ?? apiHealth.metadata?.environment;
  const webEnv = webHealth.environment ?? webHealth.metadata?.environment;
  if (apiEnv !== expectedEnvLabel) {
    throw new Error(`API environment label must be "${expectedEnvLabel}", got "${apiEnv}"`);
  }
  if (webEnv !== expectedEnvLabel) {
    throw new Error(`Web environment label must be "${expectedEnvLabel}", got "${webEnv}"`);
  }
}

// ── Runner ────────────────────────────────────────────────────────────────────

const results = [];
let deployedShaActual = 'unknown';

for (const [name, run] of checks) {
  try {
    const ret = await run();
    // Capture the deployed SHA from the version check for the summary.
    if (name === 'api version sha' && ret?.actualSha) {
      deployedShaActual = ret.actualSha;
    }
    results.push({ name, status: 'PASS' });
    console.log(`PASS  ${name}`);
  } catch (error) {
    results.push({ name, status: 'FAIL', error: error.message });
    console.error(`FAIL  ${name}: ${error.message}`);
  }
}

const failures = results.filter((r) => r.status === 'FAIL');
const summary = {
  status: failures.length === 0 ? 'PASS' : 'FAIL',
  environment: smokeEnv,
  expectedSha: expectedSha ?? 'not-provided',
  deployedSha: deployedShaActual,
  checksRun: results.length,
  failures: failures.length,
  results,
};
console.log(JSON.stringify(summary, null, 2));

if (failures.length > 0) {
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function requiredUrl(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value.replace(/\/+$/, '');
}

async function expectJson(url, options = {}) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  const body = await response.json();
  if (options.ok && !options.ok(body)) {
    throw new Error(`${url} returned unexpected JSON: ${JSON.stringify(body).slice(0, 200)}`);
  }
  return body;
}

async function expectHtml(url, expectedFragments) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  const body = await response.text();
  const missing = expectedFragments.filter((f) => !body.includes(f));
  if (missing.length > 0) {
    throw new Error(`${url} missing expected text: ${missing.join(', ')}`);
  }
}

async function expectStatus(url, acceptedStatuses) {
  const response = await fetchWithTimeout(url);
  if (!acceptedStatuses.includes(response.status)) {
    throw new Error(`${url} returned ${response.status}, expected one of: ${acceptedStatuses.join(', ')}`);
  }
}

async function fetchWithTimeout(url) {
  // Mode A: when SMOKE_EC2_IP is set, rewrite the URL to the EC2 IP and inject
  // the Host header, matching what Caddy receives from the security group.
  let fetchUrl = url;
  const headers = { accept: 'application/json,text/html;q=0.9,*/*;q=0.8' };

  if (ec2Ip && isBeta) {
    const parsed = new URL(url);
    headers['Host'] = parsed.hostname;
    fetchUrl = url.replace(`${parsed.protocol}//${parsed.hostname}`, `${parsed.protocol}//${ec2Ip}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(fetchUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers,
    });
  } finally {
    clearTimeout(timeout);
  }
}
