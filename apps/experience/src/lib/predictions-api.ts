import { apiFetch, apiPost } from './api';

export interface ScorePrediction {
  id: string;
  fixtureId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  status: string;
  pointsAwarded: number | null;
  submittedAt: string;
}

export function createScorePrediction(dto: {
  fixtureId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
}): Promise<ScorePrediction> {
  return apiPost<ScorePrediction>('/predictions', dto);
}

export function getMyFixturePrediction(fixtureId: string): Promise<ScorePrediction | null> {
  return apiFetch<ScorePrediction | null>(
    `/predictions/fixtures/${encodeURIComponent(fixtureId)}/my-prediction`,
  );
}
