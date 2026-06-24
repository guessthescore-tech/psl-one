export class CreateCampaignDraftDto {
  title!: string;
  description?: string;
  startsAt!: string;
  endsAt!: string;
  campaignType?: string;
  clubIds?: string[];
}

export class CreateAudienceSegmentDto {
  name!: string;
  description?: string;
  criteria?: Record<string, unknown>;
}

export class UpdateAudienceSegmentDto {
  name?: string;
  description?: string;
  criteria?: Record<string, unknown>;
  estimatedSize?: number;
  isActive?: boolean;
}
