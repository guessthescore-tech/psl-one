import { z } from 'zod';

export const FIXTURE_CREATED_TOPIC = 'football.fixture.created';
export const FIXTURE_UPDATED_TOPIC = 'football.fixture.updated';
export const MATCH_STARTED_TOPIC = 'football.match.started';
export const MATCH_FINISHED_TOPIC = 'football.match.finished';
export const GOAL_SCORED_TOPIC = 'football.goal.scored';

export const FixturePayloadSchema = z.object({
  fixtureId: z.string().uuid(),
  competitionId: z.string().uuid(),
  seasonId: z.string().uuid(),
  homeClubId: z.string().uuid(),
  awayClubId: z.string().uuid(),
  kickoffAt: z.string().datetime(),
  venue: z.string().optional(),
  gameweek: z.number().int().positive().optional(),
});

export type FixturePayload = z.infer<typeof FixturePayloadSchema>;

export const MatchFinishedPayloadSchema = z.object({
  fixtureId: z.string().uuid(),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  finishedAt: z.string().datetime(),
  playerStats: z.array(z.object({
    playerId: z.string().uuid(),
    clubId: z.string().uuid(),
    minutesPlayed: z.number().int().min(0),
    goals: z.number().int().min(0),
    assists: z.number().int().min(0),
    yellowCards: z.number().int().min(0),
    redCards: z.number().int().min(0),
    cleanSheet: z.boolean(),
    saves: z.number().int().min(0).optional(),
  })),
});

export type MatchFinishedPayload = z.infer<typeof MatchFinishedPayloadSchema>;
