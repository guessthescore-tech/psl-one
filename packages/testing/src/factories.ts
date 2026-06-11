import { v4 as uuid } from 'uuid';

export const testUserId = () => uuid();
export const testFixtureId = () => uuid();
export const testCorrelationId = () => uuid();

export function buildUserRegisteredEvent(overrides: Partial<{
  userId: string;
  email: string;
  mobile: string;
}> = {}) {
  return {
    userId: overrides.userId ?? uuid(),
    email: overrides.email ?? `test-${uuid()}@pslone.co.za`,
    mobile: overrides.mobile ?? '+27821234567',
    province: 'Gauteng',
    consentMarketing: true,
    consentAnalytics: true,
    consentThirdParty: false,
  };
}
