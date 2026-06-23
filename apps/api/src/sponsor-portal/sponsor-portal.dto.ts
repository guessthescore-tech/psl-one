export class CreateCampaignDraftDto {
  title!: string;
  description?: string;
  startsAt!: string;
  endsAt!: string;
  campaignType?: string;
  clubIds?: string[];
}
