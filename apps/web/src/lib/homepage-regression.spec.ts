import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const src = readFileSync(join(__dirname, '../app/page.tsx'), 'utf-8');

describe('Homepage (/) regression — STORY-FE-BETA-01', () => {
  it('includes main fan navigation', () => {
    expect(src).toContain('aria-label="Main navigation"');
    expect(src).toContain('/matches');
    expect(src).toContain('/fantasy');
    expect(src).toContain('/predictions');
    expect(src).toContain('/leaderboards');
  });

  it('includes upcoming fixtures section', () => {
    expect(src).toContain('Upcoming Fixtures');
    expect(src).toContain("aria-label=\"Upcoming fixtures\"");
  });

  it('includes fantasy entry point', () => {
    expect(src).toContain('Fantasy Football');
    expect(src).toContain('Play Fantasy Football');
    expect(src).toContain("href=\"/fantasy\"");
  });

  it('includes predictions entry point', () => {
    expect(src).toContain('Make a Prediction');
    expect(src).toContain("href=\"/predictions\"");
  });

  it('includes social challenges entry point', () => {
    expect(src).toContain('Social Challenges');
    expect(src).toContain("href=\"/social-challenges\"");
  });

  it('includes leaderboard entry point', () => {
    expect(src).toContain('Leaderboards');
    expect(src).toContain("href=\"/leaderboards\"");
  });

  it('includes mobile bottom navigation', () => {
    expect(src).toContain('aria-label="Mobile navigation"');
    expect(src).toContain('Mobile navigation');
  });

  it('includes World Cup 2026 beta season context', () => {
    expect(src).toContain('World Cup 2026');
    expect(src).toContain('Beta Season');
  });

  it('does not present PSL as the active season', () => {
    expect(src).toContain('Coming Soon');
    expect(src).not.toMatch(/PSL.{0,20}(is active|current season|now live)/i);
  });

  it('includes non-financial disclaimers', () => {
    expect(src).toContain('non-financial');
    expect(src).toContain('no real money');
    expect(src).toContain('Points only');
    expect(src).not.toContain('betting odds');
    expect(src).not.toContain('place a bet');
    expect(src).not.toContain('odds');
    expect(src).not.toContain('cash prize');
  });

  it('wallet is presented as sandbox only', () => {
    expect(src).toContain('Wallet (Sandbox)');
  });

  it('includes fan journey section with rewards', () => {
    expect(src).toContain('Fan Value');
    expect(src).toContain('Achievements');
    expect(src).toContain('Reward Readiness');
  });

  it('includes clubs and media sections', () => {
    expect(src).toContain("href=\"/clubs\"");
    expect(src).toContain("href=\"/media\"");
  });

  it('includes environment label from runtime metadata', () => {
    expect(src).toContain('getWebRuntimeMetadata');
    expect(src).toContain('meta.environment');
  });

  it('is not the placeholder dark page', () => {
    // old placeholder: dark bg, no feature sections, no navigation
    expect(src).not.toContain('bg-[#1a1a2e]');
    expect(src).not.toContain("href=\"/health\"\n              className=\"rounded-md bg-[#1b3a6b]");
  });

  it('connects to live API (uses footballClient)', () => {
    expect(src).toContain('footballClient');
    expect(src).toContain('getActiveSeason');
    expect(src).toContain('listFixtures');
  });

  it('/api/health endpoint remains accessible (not removed)', () => {
    // The health link must appear somewhere in the page (footer)
    expect(src).toContain("href=\"/health\"");
  });
});
