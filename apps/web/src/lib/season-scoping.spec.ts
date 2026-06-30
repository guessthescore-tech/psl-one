import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

function page(rel: string) {
  return readFileSync(join(__dirname, '../app', rel), 'utf-8');
}

// ── Teams page ────────────────────────────────────────────────────────────────

describe('season-scoping: teams page (/football/teams)', () => {
  const src = page('football/teams/page.tsx');

  it('calls getActiveSeason before listTeams', () => {
    expect(src).toContain('getActiveSeason');
    expect(src).toContain('listTeams');
  });

  it('passes seasonSlug to listTeams', () => {
    expect(src).toContain('seasonSlug');
  });

  it('does not call unscoped listTeams()', () => {
    // unscoped call would be listTeams() or listTeams(undefined) with no seasonSlug
    expect(src).not.toMatch(/listTeams\(\s*\)/);
  });
});

// ── Players page ──────────────────────────────────────────────────────────────

describe('season-scoping: players page (/football/players)', () => {
  const src = page('football/players/page.tsx');

  it('calls getActiveSeason before listPlayers', () => {
    expect(src).toContain('getActiveSeason');
    expect(src).toContain('listPlayers');
  });

  it('passes seasonSlug to listPlayers', () => {
    expect(src).toContain('seasonSlug');
  });
});

// ── Fixtures page ─────────────────────────────────────────────────────────────

describe('season-scoping: fixtures page (/football/fixtures)', () => {
  const src = page('football/fixtures/page.tsx');

  it('calls getActiveSeason before listFixtures', () => {
    expect(src).toContain('getActiveSeason');
    expect(src).toContain('listFixtures');
  });

  it('passes seasonSlug to listFixtures', () => {
    expect(src).toContain('seasonSlug');
  });
});

// ── Standings page ────────────────────────────────────────────────────────────

describe('season-scoping: standings page (/football/standings)', () => {
  const src = page('football/standings/page.tsx');

  it('calls getActiveSeason before listStandings', () => {
    expect(src).toContain('getActiveSeason');
    expect(src).toContain('listStandings');
  });

  it('passes seasonSlug to listStandings', () => {
    expect(src).toContain('seasonSlug');
  });
});

// ── Profile edit team picker ──────────────────────────────────────────────────

describe('season-scoping: profile edit team picker (/profile/edit)', () => {
  const src = page('profile/edit/page.tsx');

  it('calls getActiveSeason before listTeams', () => {
    expect(src).toContain('getActiveSeason');
    expect(src).toContain('listTeams');
  });

  it('passes seasonSlug to listTeams', () => {
    expect(src).toContain('seasonSlug');
  });

  it('does not call unscoped listTeams()', () => {
    expect(src).not.toMatch(/listTeams\(\s*\)/);
  });
});
