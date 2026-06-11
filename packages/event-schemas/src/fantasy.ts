import { z } from 'zod';

export const FANTASY_SQUAD_CREATED_TOPIC = 'fantasy.squad.created';
export const FANTASY_SQUAD_UPDATED_TOPIC = 'fantasy.squad.updated';
export const FANTASY_GAMEWEEK_SCORED_TOPIC = 'fantasy.gameweek.scored';

export const FantasySquadCreatedPayloadSchema = z.object({
  squadId: z.string().uuid(),
  userId: z.string().uuid(),
  gameweekId: z.string().uuid(),
  playerIds: z.array(z.string().uuid()).length(15),
  captainId: z.string().uuid(),
  viceCaptainId: z.string().uuid(),
});

export type FantasySquadCreatedPayload = z.infer<typeof FantasySquadCreatedPayloadSchema>;

export const FantasyGameweekScoredPayloadSchema = z.object({
  gameweekId: z.string().uuid(),
  userId: z.string().uuid(),
  squadId: z.string().uuid(),
  totalPoints: z.number().int(),
  rank: z.number().int().positive().optional(),
});

export type FantasyGameweekScoredPayload = z.infer<typeof FantasyGameweekScoredPayloadSchema>;
