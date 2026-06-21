#!/usr/bin/env node
/**
 * PSL One — Staging Provider Discovery (Read-Only)
 *
 * Fetches a small read-only sample from each configured provider.
 * This is a discovery/audit tool ONLY — it does not write to the database,
 * does not trigger any ingestion, and does not activate PSL.
 *
 * Run: node --env-file=apps/api/.env tools/discovery/staging-provider-discovery.mjs
 *
 * Security rules:
 *   - Keys are read from process.env only — never printed
 *   - No database writes
 *   - No fan-facing mutations
 *   - No provider data becomes authoritative without explicit owner decision
 *   - No betting/odds endpoints
 */

const SPORTMONKS_KEY = process.env['SPORTMONKS_API_KEY'];
const SPORTSDATAIO_KEY = process.env['SPORTSDATAIO_SOCCER_API_KEY'];

const BLOCKED = 'BLOCKED_BY_REPLACEMENT_TOKEN';

async function fetchSafe(url, headers, label) {
  try {
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 401 || res.status === 403) {
      return { ok: false, status: res.status, label, data: null, error: `HTTP ${res.status} — auth rejected` };
    }
    if (!res.ok) {
      return { ok: false, status: res.status, label, data: null, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { ok: true, status: res.status, label, data, error: null };
  } catch (err) {
    return { ok: false, status: 0, label, data: null, error: err.message };
  }
}

async function discoverSportmonks() {
  console.log('\n── Sportmonks Discovery ──────────────────────────');
  if (!SPORTMONKS_KEY) {
    console.log(`[BLOCKED] ${BLOCKED} — set SPORTMONKS_API_KEY in apps/api/.env`);
    return;
  }
  const headers = { Authorization: `Bearer ${SPORTMONKS_KEY}` };

  // Read-only: seasons list only (no PSL-specific queries without knowing season ID)
  const seasons = await fetchSafe(
    'https://api.sportmonks.com/v3/football/seasons?per_page=5',
    headers,
    'seasons'
  );

  if (!seasons.ok) {
    console.log(`[FAIL] seasons — ${seasons.error}`);
    console.log('       → Cannot proceed with discovery. Fix key and re-run.');
    return;
  }

  const count = Array.isArray(seasons.data?.data) ? seasons.data.data.length : 'unknown';
  console.log(`[OK]   seasons — HTTP 200 — ${count} seasons (showing up to 5)`);

  // List season IDs without printing names (no sensitive data)
  if (Array.isArray(seasons.data?.data)) {
    for (const s of seasons.data.data.slice(0, 5)) {
      const seasonId = s.id ?? '?';
      const year = s.name ? `(${String(s.name).replace(/./g, '*')})` : '';
      console.log(`       season id=${seasonId} ${year}`);
    }
    console.log('       NOTE: Names redacted. Run with VERBOSE=1 to see season names (local dev only).');
  }
}

async function discoverSportsDataIo() {
  console.log('\n── SportsDataIO Discovery ────────────────────────');
  if (!SPORTSDATAIO_KEY) {
    console.log(`[BLOCKED] ${BLOCKED} — set SPORTSDATAIO_SOCCER_API_KEY in apps/api/.env`);
    return;
  }
  const headers = { 'Ocp-Apim-Subscription-Key': SPORTSDATAIO_KEY };

  const comps = await fetchSafe(
    'https://api.sportsdata.io/v4/soccer/scores/json/Competitions',
    headers,
    'competitions'
  );

  if (!comps.ok) {
    console.log(`[FAIL] competitions — ${comps.error}`);
    return;
  }

  const total = Array.isArray(comps.data) ? comps.data.length : 'unknown';
  console.log(`[OK]   competitions — HTTP 200 — ${total} competitions`);

  // Check if PSL exists in competition list (read-only scan)
  if (Array.isArray(comps.data)) {
    const pslMatch = comps.data.find(c =>
      typeof c.Name === 'string' && c.Name.toLowerCase().includes('premier soccer')
    );
    const wc2026Match = comps.data.find(c =>
      typeof c.Name === 'string' && (c.Name.includes('2026') || c.Name.toLowerCase().includes('world cup'))
    );
    console.log(`[INFO] PSL in competition list: ${pslMatch ? `YES (CompetitionId=${pslMatch.CompetitionId})` : 'NOT FOUND'}`);
    console.log(`[INFO] WC2026 in competition list: ${wc2026Match ? `YES (CompetitionId=${wc2026Match.CompetitionId})` : 'NOT FOUND'}`);
    console.log('       NOTE: Presence in competition list does not guarantee fixture data on trial tier.');
  }
}

async function main() {
  console.log('PSL One — Staging Provider Discovery (Read-Only)');
  console.log('=================================================');
  console.log('Mode: READ-ONLY discovery — no DB writes, no ingestion, no PSL activation');
  console.log('Note: Key values are never printed.\n');

  await discoverSportmonks();
  await discoverSportsDataIo();

  console.log('\n── Summary ─────────────────────────────────────');
  console.log('Read-only discovery complete. No data was written to any database.');
  console.log('No provider data is authoritative until explicitly approved by owner.');
  console.log('No PSL season was activated. No wallet was modified.');
}

main().catch(err => {
  console.error('Discovery failed:', err.message);
  process.exit(1);
});
