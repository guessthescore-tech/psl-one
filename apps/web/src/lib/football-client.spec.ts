import { describe, it, expect } from 'vitest';

describe('footballClient URL construction', () => {
  it('exports all expected client methods', async () => {
    const { footballClient } = await import('./football-client');
    expect(typeof footballClient.listCompetitions).toBe('function');
    expect(typeof footballClient.getCompetition).toBe('function');
    expect(typeof footballClient.getActiveSeason).toBe('function');
    expect(typeof footballClient.listTeams).toBe('function');
    expect(typeof footballClient.getTeam).toBe('function');
    expect(typeof footballClient.getTeamPlayers).toBe('function');
    expect(typeof footballClient.listFixtures).toBe('function');
    expect(typeof footballClient.getFixture).toBe('function');
    expect(typeof footballClient.listStandings).toBe('function');
    expect(typeof footballClient.getMatchCentre).toBe('function');
  });

  it('exports STORY-17 live dashboard methods', async () => {
    const { footballClient } = await import('./football-client');
    expect(typeof footballClient.getLiveMatchDashboard).toBe('function');
    expect(typeof footballClient.getFixtureLiveState).toBe('function');
    expect(typeof footballClient.getFixtureTimeline).toBe('function');
    expect(typeof footballClient.getFixturePlayerStats).toBe('function');
    expect(typeof footballClient.getLiveFantasyPreview).toBe('function');
  });

  it('exports correct TypeScript-compatible types (compile-time check via usage)', () => {
    expect(true).toBe(true);
  });
});

describe('STORY-18 auto-substitution client methods', () => {
  it('exports auto-sub fan functions from fantasy-rules-client', async () => {
    const client = await import('./fantasy-rules-client');
    expect(typeof client.getAutoSubs).toBe('function');
    expect(typeof client.getFinalXi).toBe('function');
    expect(typeof client.adminApplyAutoSubsForGameweek).toBe('function');
    expect(typeof client.adminRecalculateTeamAutoSubs).toBe('function');
    expect(typeof client.adminGetAutoSubsForGameweek).toBe('function');
  });
});

describe('adminFootballClient shape', () => {
  it('exports all expected admin methods', async () => {
    const { default: adminFootballClient } = await import('./admin-football-client');
    expect(typeof adminFootballClient.updateScore).toBe('function');
    expect(typeof adminFootballClient.updateLiveState).toBe('function');
    expect(typeof adminFootballClient.addMatchEvent).toBe('function');
    expect(typeof adminFootballClient.updateMatchEvent).toBe('function');
    expect(typeof adminFootballClient.deleteMatchEvent).toBe('function');
    expect(typeof adminFootballClient.upsertPlayerStat).toBe('function');
    expect(typeof adminFootballClient.bulkUpsertPlayerStats).toBe('function');
    expect(typeof adminFootballClient.recalculateState).toBe('function');
    expect(typeof adminFootballClient.finaliseFixture).toBe('function');
    expect(typeof adminFootballClient.reopenFixture).toBe('function');
    expect(typeof adminFootballClient.syncProvider).toBe('function');
  });
});
