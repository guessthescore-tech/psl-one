export type UUID = string;
export type ISO8601 = string;
export type TenantId = string;

export interface BaseEntity {
  id: UUID;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface SoftDeletableEntity extends BaseEntity {
  deletedAt: ISO8601 | null;
}

export enum ConsentPurpose {
  MARKETING = 'MARKETING',
  ANALYTICS = 'ANALYTICS',
  THIRD_PARTY_SHARING = 'THIRD_PARTY_SHARING',
}
