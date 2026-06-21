import { IsString, IsIn, IsObject, IsOptional } from 'class-validator';

const ALLOWED_EVENTS = [
  'registration_started',
  'registration_completed',
  'sign_in_completed',
  'favourite_team_selected',
  'onboarding_started',
  'onboarding_step_completed',
  'onboarding_completed',
  'prediction_submitted',
  'challenge_created',
  'challenge_accepted',
  'share_clicked',
  'share_completed',
  'league_created',
  'league_joined',
  'account_deletion_requested',
  'password_changed',
] as const;

const FORBIDDEN_FIELDS = ['password', 'token', 'wallet', 'apiKey', 'api_key', 'secret', 'authorization', 'Bearer'] as const;

export class TrackEventDto {
  @IsString()
  @IsIn(ALLOWED_EVENTS)
  event!: string;

  @IsOptional()
  @IsObject()
  properties?: Record<string, string | number | boolean>;
}

export function sanitizeProperties(props?: Record<string, unknown>): Record<string, string | number | boolean> {
  if (!props) return {};
  const result: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    const keyLower = k.toLowerCase();
    if (FORBIDDEN_FIELDS.some(f => keyLower.includes(f.toLowerCase()))) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      result[k] = v;
    }
  }
  return result;
}
