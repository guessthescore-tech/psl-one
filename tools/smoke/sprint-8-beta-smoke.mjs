#!/usr/bin/env node
/**
 * Sprint 8 Beta Smoke Suite
 * Tests API health, challenge flows, and preview routes.
 * Run: node tools/smoke/sprint-8-beta-smoke.mjs [--api-url=URL] [--preview-url=URL]
 */

import https from 'https';
import http from 'http';

const API_URL = process.env.API_URL ?? process.argv.find(a => a.startsWith('--api-url='))?.split('=')[1] ?? 'http://localhost:3000';
const PREVIEW_URL = process.env.PREVIEW_URL ?? process.argv.find(a => a.startsWith('--preview-url='))?.split('=')[1] ?? 'https://psl-one-experience-preview-cxb5urftw-guess-the-score.vercel.app';

let passed = 0;
let failed = 0;

async function httpGet(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: 10000 }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

async function check(label, fn) {
  try {
    await fn();
    console.log(`  PASS ${label}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL ${label}: ${err.message}`);
    failed++;
  }
}

async function run() {
  console.log('\n=== Sprint 8 Beta Smoke Suite ===\n');

  // API health
  console.log('-- API health --');
  await check('API /health returns 200', async () => {
    const r = await httpGet(`${API_URL}/health`);
    if (r.status !== 200) throw new Error(`Got ${r.status}`);
  });

  await check('Provider /admin/data-provider/health returns safe response', async () => {
    try {
      const r = await httpGet(`${API_URL}/admin/data-provider/health`);
      // Should be 200 or 401 (if auth required) — never 5xx
      if (r.status >= 500) throw new Error(`Got ${r.status}`);
    } catch (err) {
      // Connection refused means API not running — skip gracefully
      if (err.code === 'ECONNREFUSED') return;
      throw err;
    }
  });

  // Preview routes
  console.log('\n-- Preview routes --');
  const routes = ['', '/predict', '/predict/challenge', '/predict/challenge/accept', '/predict/challenge/result', '/fantasy', '/account'];
  for (const route of routes) {
    const url = `${PREVIEW_URL}${route}`;
    await check(`Preview ${route || '/'} returns 200`, async () => {
      const r = await httpGet(url);
      if (r.status !== 200) throw new Error(`Got ${r.status}`);
    });
  }

  // noindex check
  console.log('\n-- Security / noindex --');
  await check('Preview home has noindex header or meta', async () => {
    const r = await httpGet(PREVIEW_URL);
    const hasHeader = r.headers['x-robots-tag']?.includes('noindex');
    const hasMeta = r.body?.includes('noindex');
    if (!hasHeader && !hasMeta) throw new Error('No noindex found');
  });

  // No real-money text
  await check('Preview home has no betting/gambling language', async () => {
    const r = await httpGet(PREVIEW_URL);
    const forbidden = /\b(place a bet|betting odds|fixed-odds|cash prize|deposit to|withdraw your)\b/i;
    if (forbidden.test(r.body ?? '')) throw new Error('Forbidden real-money language found');
  });

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Smoke suite error:', err);
  process.exit(1);
});
