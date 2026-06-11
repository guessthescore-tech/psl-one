export enum Role {
  FAN = 'FAN',
  CLUB_ADMIN = 'CLUB_ADMIN',
  SPONSOR_ADMIN = 'SPONSOR_ADMIN',
  PSL_ADMIN = 'PSL_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  roles: Role[];
  tenantId: string;
}
