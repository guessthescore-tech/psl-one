#!/usr/bin/env node
/**
 * Sprint 39 News & Video Smoke Test
 *
 * Tests:
 * - /football/world-cup/scorebat-widget returns expected shape
 * - /football/fixtures?seasonSlug=fifa-world-cup-2026 returns fixtures
 * - Documents media status
 *
 * Usage:
 *   node tools/staging/sprint-39-news-video-smoke.mjs [BASE_URL]
 *   BASE_URL=http://16.28.84.11 node tools/staging/sprint-39-news-video-smoke.mjs
 *
 * WC_BETA · PSL_INACTIVE · NO_REAL_MONEY
 */

const BASE_URL = process.argv[2] ?? process.env.BASE_URL ?? 'http://localhost:3001';

let pass = 0;
let fail = 0;

function ok(label) {
  console.log(`  PASS  ${label}`);
  pass++;
}

function bad(label, detail) {
  console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  fail++;
}

console.log(`\nSprint 39 News & Video Smoke — API @ ${BASE_URL}`);
console.log('='.repeat(60));

// Check ScoreBat widget endpoint shape
try {
  const res = await fetch(`${BASE_URL}/football/world-cup/scorebat-widget`, {
    signal: AbortSignal.timeout(8000),
  });

  if (res.status === 200) {
    ok('ScoreBat widget endpoint returns 200');
    const data = await res.json();

    if (typeof data.available === 'boolean') {
      ok(`ScoreBat widget.available is boolean (${data.available})`);
    } else {
      bad('ScoreBat widget.available should be boolean', `got ${typeof data.available}`);
    }

    if (data.available === false || typeof data.embedUrl === 'string' || data.embedUrl === null) {
      ok(`ScoreBat widget.embedUrl is valid (${data.available ? 'HAS_URL' : 'NULL — token not set'})`);
    } else {
      bad('ScoreBat widget.embedUrl should be string or null');
    }

    if (Array.isArray(data.allowedHosts)) {
      ok(`ScoreBat widget.allowedHosts is array (${data.allowedHosts.join(', ')})`);
    } else {
      bad('ScoreBat widget.allowedHosts should be array');
    }

    // Confirm token is NOT in the response body directly (it's in embedUrl only as ScoreBat intends)
    const rawBody = JSON.stringify(data);
    if (!rawBody.includes('SCOREBAT_WIDGET_TOKEN=') && !rawBody.includes('SCOREBAT_VIDEO_API_ACCESS_TOKEN=')) {
      ok('ScoreBat response does not leak env var names as values');
    } else {
      bad('SECURITY: ScoreBat response contains env var name as value');
    }

    console.log(`\n  Media Status: ${data.available ? 'SCOREBAT_WIDGET_CONFIGURED' : 'SCOREBAT_WIDGET_TOKEN_NOT_SET'}`);
    if (data.available && data.embedUrl) {
      const url = new URL(data.embedUrl);
      console.log(`  Widget host: ${url.hostname}`);
      console.log(`  Widget path: ${url.pathname}`);
    }
  } else {
    bad(`ScoreBat widget endpoint`, `expected 200, got ${res.status}`);
  }
} catch (err) {
  bad('ScoreBat widget endpoint', `network error: ${err.message}`);
}

console.log('');

// Check WC fixtures endpoint
try {
  const res = await fetch(`${BASE_URL}/football/fixtures?seasonSlug=fifa-world-cup-2026`, {
    signal: AbortSignal.timeout(8000),
  });

  if (res.status === 200) {
    ok('WC fixtures endpoint returns 200');
    const data = await res.json();

    if (Array.isArray(data)) {
      ok(`WC fixtures is array (${data.length} fixtures)`);

      if (data.length > 0) {
        const sample = data[0];
        if (sample.kickoffAt) ok('Fixture has kickoffAt field');
        if (sample.status) ok(`Fixture has status field (sample: ${sample.status})`);
        if (sample.homeTeam || sample.homeTeamId) ok('Fixture has home team data');

        // Check statuses
        const statuses = [...new Set(data.map(f => f.status))];
        console.log(`\n  Fixture status breakdown:`);
        for (const status of statuses) {
          const count = data.filter(f => f.status === status).length;
          console.log(`    ${status}: ${count}`);
        }
      } else {
        console.log(`  Note: 0 fixtures returned — WC season may not be loaded`);
      }
    } else {
      bad('WC fixtures should return an array');
    }
  } else {
    bad('WC fixtures endpoint', `expected 200, got ${res.status}`);
  }
} catch (err) {
  bad('WC fixtures endpoint', `network error: ${err.message}`);
}

console.log('\n' + '='.repeat(60));
console.log(`Result: ${pass} PASS / ${fail} FAIL\n`);

if (fail > 0) {
  process.exit(1);
}
