import { Logger } from '@nestjs/common';
import { FixtureStatus } from '@prisma/client';
import type {
  LiveMatchProviderAdapter,
  ProviderFixtureState,
  ProviderLineupEntry,
  ProviderMatchEvent,
  ProviderPlayerStat,
} from './live-match-provider.interface';

/**
 * football-data.org v4 live-match adapter for World Cup 2026 beta.
 *
 * Covers the gap left by Sportmonks: all beta fixtures have football-data.org
 * providerFixtureId values (e.g. "537336"). This adapter calls the same
 * namespace so IDs align without reimporting fixtures.
 *
 * Free-tier limitations (documented, not hidden):
 *   - fetchFixtureEvents returns [] — minute-level event stream is not on the
 *     free tier for live matches. Use for FINISHED matches only.
 *   - saves, shotsOnTarget, etc. are not provided; they default to 0.
 *   - assists come from goal.assist and may be null for some goals.
 *
 * PSL use is not authorised — see ADR-037. This adapter is WC-only.
 * Activate via: WC_LIVE_PROVIDER=football-data-org + FOOTBALL_DATA_API_KEY
 */
export class FootballDataOrgLiveMatchAdapter implements LiveMatchProviderAdapter {
  readonly providerName = 'football-data-org';
  private readonly logger = new Logger(FootballDataOrgLiveMatchAdapter.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://api.football-data.org';

  constructor() {
    this.apiKey = process.env['FOOTBALL_DATA_API_KEY'];
    if (!this.apiKey) {
      this.logger.warn({
        action: 'provider.disabled',
        provider: this.providerName,
        requiredKey: 'FOOTBALL_DATA_API_KEY',
      });
    }
  }

  async fetchFixtureState(providerFixtureId: string): Promise<ProviderFixtureState | null> {
    const data = await this.fetchMatch(providerFixtureId);
    if (!data) return null;
    return {
      providerFixtureId,
      status: mapStatus(data.status),
      homeScore: data.score?.fullTime?.home ?? 0,
      awayScore: data.score?.fullTime?.away ?? 0,
      currentMinute: null,
      period: null,
      startedAt: null,
      halfTimeAt: null,
      resumedAt: null,
      finishedAt: null,
    };
  }

  async fetchFixtureEvents(_providerFixtureId: string): Promise<ProviderMatchEvent[]> {
    // football-data.org free tier does not expose a minute-level event stream.
    // Use manual event entry via LiveMatchService for in-game events.
    return [];
  }

  async fetchFixtureLineups(providerFixtureId: string): Promise<ProviderLineupEntry[]> {
    const data = await this.fetchMatch(providerFixtureId);
    if (!data?.lineups?.length) return [];
    return data.lineups.flatMap((lineup) => {
      const teamRef = String(lineup.team.id);
      const starting: ProviderLineupEntry[] = (lineup.startXI ?? []).map((e) => ({
        playerProviderRef: String(e.player.id),
        teamProviderRef: teamRef,
        status: 'STARTING' as const,
        shirtNumber: null,
        position: e.player.position ?? null,
      }));
      const bench: ProviderLineupEntry[] = (lineup.bench ?? []).map((e) => ({
        playerProviderRef: String(e.player.id),
        teamProviderRef: teamRef,
        status: 'SUBSTITUTE' as const,
        shirtNumber: null,
        position: e.player.position ?? null,
      }));
      return [...starting, ...bench];
    });
  }

  async fetchFixturePlayerStats(providerFixtureId: string): Promise<ProviderPlayerStat[]> {
    const data = await this.fetchMatch(providerFixtureId);
    if (!data) return [];
    return computePlayerStats(data);
  }

  // ── Internal ─────────────────────────────────────────────────────────────────

  async fetchMatch(providerFixtureId: string): Promise<FdMatchDetail | null> {
    if (!this.apiKey) return null;
    try {
      const res = await fetch(`${this.baseUrl}/v4/matches/${providerFixtureId}`, {
        headers: { 'X-Auth-Token': this.apiKey },
        signal: AbortSignal.timeout(8000),
      });
      if (res.status === 401 || res.status === 403) {
        this.logger.warn({ action: 'provider.auth_error', provider: this.providerName, statusCode: res.status });
        return null;
      }
      if (res.status === 429) {
        this.logger.warn({ action: 'provider.rate_limited', provider: this.providerName });
        return null;
      }
      if (!res.ok) {
        this.logger.warn({ action: 'provider.http_error', provider: this.providerName, statusCode: res.status });
        return null;
      }
      return (await res.json()) as FdMatchDetail;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn({ action: 'provider.fetch_failed', provider: this.providerName, error: msg });
      return null;
    }
  }
}

// ── football-data.org v4 match detail raw types ───────────────────────────────

export interface FdMatchDetail {
  id: number;
  status: string;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
  goals?: FdGoal[];
  bookings?: FdBooking[];
  substitutions?: FdSubstitution[];
  lineups?: FdLineup[];
}

interface FdGoal {
  minute: number;
  type?: string; // 'REGULAR' | 'PENALTY' | 'OWN_GOAL'
  scorer: { id: number; name: string };
  assist?: { id: number; name: string } | null;
  team: { id: number; name: string };
}

interface FdBooking {
  minute: number;
  player: { id: number; name: string };
  team: { id: number; name: string };
  card: 'YELLOW_CARD' | 'RED_CARD';
}

interface FdSubstitution {
  minute: number;
  player: { id: number; name: string };     // coming off
  replacedBy: { id: number; name: string }; // coming on
  team: { id: number; name: string };
}

interface FdLineup {
  team: { id: number; name: string };
  startXI?: Array<{ player: { id: number; name: string; position?: string | null } }>;
  bench?: Array<{ player: { id: number; name: string; position?: string | null } }>;
}

// ── Stat computation ──────────────────────────────────────────────────────────

interface PlayerAccumulator {
  teamRef: string;
  started: boolean;
  minutesPlayed: number;
  cameOnMinute: number | null;
  subbedOffMinute: number | null;
  goals: number;
  ownGoals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export function computePlayerStats(match: FdMatchDetail): ProviderPlayerStat[] {
  const homeRef = String(match.homeTeam.id);
  const awayRef = String(match.awayTeam.id);
  const homeScore = match.score?.fullTime?.home ?? 0;
  const awayScore = match.score?.fullTime?.away ?? 0;

  // home team concedes away goals and vice versa
  const goalsConcededByTeam: Record<string, number> = {
    [homeRef]: awayScore,
    [awayRef]: homeScore,
  };

  const accMap = new Map<string, PlayerAccumulator>();

  const ensure = (playerRef: string, teamRef: string): PlayerAccumulator => {
    let acc = accMap.get(playerRef);
    if (!acc) {
      acc = {
        teamRef,
        started: false,
        minutesPlayed: 0,
        cameOnMinute: null,
        subbedOffMinute: null,
        goals: 0,
        ownGoals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
      };
      accMap.set(playerRef, acc);
    }
    return acc;
  };

  // Starting XI: baseline 90 minutes (adjusted by substitutions below)
  for (const lineup of match.lineups ?? []) {
    const teamRef = String(lineup.team.id);
    for (const entry of lineup.startXI ?? []) {
      const acc = ensure(String(entry.player.id), teamRef);
      acc.started = true;
      acc.minutesPlayed = 90;
    }
  }

  // Substitutions: cap the player going off, track minutes for player coming on
  for (const sub of match.substitutions ?? []) {
    const teamRef = String(sub.team.id);
    const minute = Math.min(sub.minute, 90);

    const outAcc = ensure(String(sub.player.id), teamRef);
    outAcc.subbedOffMinute = minute;
    outAcc.minutesPlayed = minute;

    const inAcc = ensure(String(sub.replacedBy.id), teamRef);
    inAcc.cameOnMinute = minute;
    inAcc.minutesPlayed = Math.max(0, 90 - minute);
  }

  // Goals and assists
  for (const goal of match.goals ?? []) {
    const teamRef = String(goal.team.id);
    const scorerAcc = ensure(String(goal.scorer.id), teamRef);
    if (goal.type === 'OWN_GOAL') {
      scorerAcc.ownGoals++;
    } else {
      scorerAcc.goals++;
    }
    if (goal.assist?.id != null) {
      const assistAcc = ensure(String(goal.assist.id), teamRef);
      assistAcc.assists++;
    }
  }

  // Bookings
  for (const booking of match.bookings ?? []) {
    const teamRef = String(booking.team.id);
    const acc = ensure(String(booking.player.id), teamRef);
    if (booking.card === 'YELLOW_CARD') acc.yellowCards++;
    else if (booking.card === 'RED_CARD') acc.redCards++;
  }

  return Array.from(accMap.entries()).map(([playerRef, acc]) => {
    const conceded = goalsConcededByTeam[acc.teamRef] ?? 0;
    return {
      playerProviderRef: playerRef,
      teamProviderRef: acc.teamRef,
      minutesPlayed: acc.minutesPlayed,
      goals: acc.goals,
      assists: acc.assists,
      ownGoals: acc.ownGoals,
      yellowCards: acc.yellowCards,
      redCards: acc.redCards,
      saves: 0,
      goalsConceded: conceded,
      cleanSheet: conceded === 0 && acc.minutesPlayed >= 60,
      started: acc.started,
      cameOnMinute: acc.cameOnMinute,
      subbedOffMinute: acc.subbedOffMinute,
    };
  });
}

// ── Status mapper ─────────────────────────────────────────────────────────────

function mapStatus(status: string): FixtureStatus {
  const s = status?.toUpperCase() ?? '';
  if (s === 'IN_PLAY' || s === 'PAUSED') return FixtureStatus.LIVE;
  if (s === 'FINISHED') return FixtureStatus.FINISHED;
  if (s === 'POSTPONED') return FixtureStatus.POSTPONED;
  if (s === 'CANCELLED' || s === 'SUSPENDED') return FixtureStatus.CANCELLED;
  return FixtureStatus.SCHEDULED;
}
