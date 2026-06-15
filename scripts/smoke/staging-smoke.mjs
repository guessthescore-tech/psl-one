#!/usr/bin/env node

const apiBaseUrl = requiredUrl('STAGING_API_BASE_URL');
const webBaseUrl = requiredUrl('STAGING_WEB_BASE_URL');

const checks = [
  ['api liveness', () => expectJson(`${apiBaseUrl}/health`, { ok: (body) => body.status === 'ok' && body.service === 'api' })],
  ['api readiness', () => expectJson(`${apiBaseUrl}/health/ready`, { ok: (body) => body.status === 'ready' && body.checks?.database === 'ok' })],
  ['api version', () => expectJson(`${apiBaseUrl}/version`, { ok: (body) => typeof body.gitSha === 'string' && body.gitSha !== '' })],
  ['web health', () => expectJson(`${webBaseUrl}/api/health`, { ok: (body) => body.status === 'ok' && body.service === 'web' })],
  ['web landing', () => expectHtml(`${webBaseUrl}/`, ['PSL One'])],
  ['active season exists', checkActiveSeason],
  ['world cup season is historical', checkWorldCupHistorical],
  ['psl season exists and is inactive', checkPslSeasonInactive],
  ['psl activation status is not ACTIVATED', checkPslNotActivated],
  ['fixtures', () => expectJson(`${apiBaseUrl}/football/fixtures?limit=1`)],
  ['standings', () => expectJson(`${apiBaseUrl}/football/standings`)],
  ['match centre', () => expectHtml(`${webBaseUrl}/matches`, ['Match'])],
  ['fantasy landing', () => expectHtml(`${webBaseUrl}/fantasy`, ['Fantasy'])],
  ['guess the score landing', () => expectHtml(`${webBaseUrl}/predictions`, ['Predict'])],
  ['social prediction landing', () => expectHtml(`${webBaseUrl}/social-challenges`, ['Challenge'])],
  ['leaderboards', () => expectHtml(`${webBaseUrl}/leaderboards`, ['Leaderboard'])],
  ['unauthenticated admin rejection', () => expectStatus(`${apiBaseUrl}/seasons/admin/context`, [401, 403])],
  ['staging environment label', checkEnvironmentLabel],
];

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
    throw new Error(`PSL season must not be ACTIVATED in staging; found ACTIVATED approval record`);
  }
}

async function checkEnvironmentLabel() {
  const apiHealth = await expectJson(`${apiBaseUrl}/health`);
  const webHealth = await expectJson(`${webBaseUrl}/api/health`);
  const apiEnv = apiHealth.environment ?? apiHealth.metadata?.environment;
  const webEnv = webHealth.environment ?? webHealth.metadata?.environment;
  if (apiEnv !== 'staging') {
    throw new Error(`API environment label must be "staging", got "${apiEnv}"`);
  }
  if (webEnv !== 'staging') {
    throw new Error(`Web environment label must be "staging", got "${webEnv}"`);
  }
}

const results = [];

for (const [name, run] of checks) {
  try {
    await run();
    results.push({ name, status: 'PASS' });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, status: 'FAIL', error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

const failures = results.filter((result) => result.status === 'FAIL');
if (failures.length > 0) {
  console.error(JSON.stringify({ status: 'FAIL', failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: 'PASS', checks: results.length }, null, 2));

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
  const missing = expectedFragments.filter((fragment) => !body.includes(fragment));
  if (missing.length > 0) {
    throw new Error(`${url} missing expected text: ${missing.join(', ')}`);
  }
}

async function expectStatus(url, acceptedStatuses) {
  const response = await fetchWithTimeout(url);
  if (!acceptedStatuses.includes(response.status)) {
    throw new Error(`${url} returned ${response.status}, expected ${acceptedStatuses.join(' or ')}`);
  }
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}
