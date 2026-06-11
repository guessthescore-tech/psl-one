export const queryKeys = {
  football: {
    fixtures: (competitionId: string) => ['football', 'fixtures', competitionId] as const,
    fixture: (id: string) => ['football', 'fixture', id] as const,
    standings: (seasonId: string) => ['football', 'standings', seasonId] as const,
    competitions: () => ['football', 'competitions'] as const,
  },
  fantasy: {
    squad: (userId: string) => ['fantasy', 'squad', userId] as const,
    gameweek: (id: string) => ['fantasy', 'gameweek', id] as const,
    leaderboard: (gameweekId?: string) => ['fantasy', 'leaderboard', gameweekId] as const,
  },
  loyalty: {
    account: (userId: string) => ['loyalty', 'account', userId] as const,
    transactions: (userId: string) => ['loyalty', 'transactions', userId] as const,
  },
  gts: {
    predictions: (userId: string, gameweekId?: string) => ['gts', 'predictions', userId, gameweekId] as const,
    leaderboard: (gameweekId?: string) => ['gts', 'leaderboard', gameweekId] as const,
  },
  identity: {
    me: () => ['identity', 'me'] as const,
  },
} as const;
