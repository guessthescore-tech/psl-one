import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SponsorPortalController } from './sponsor-portal.controller';
import type { SponsorPortalService } from './sponsor-portal.service';

const makeService = () => ({
  getSponsorOverview: vi.fn().mockResolvedValue({ scopeStatus: 'API_SCOPE_PENDING' }),
  getSponsorProfile: vi.fn().mockResolvedValue({ scopeStatus: 'API_SCOPE_PENDING' }),
  getSponsorCampaigns: vi.fn().mockResolvedValue([]),
  createCampaignDraft: vi.fn().mockResolvedValue({ id: 'camp-new', status: 'DRAFT' }),
  getSponsorAudiences: vi.fn().mockReturnValue({ audienceStatus: 'PLANNED', segments: [] }),
  getSponsorActivations: vi.fn().mockResolvedValue([]),
  getSponsorRewards: vi.fn().mockResolvedValue([]),
  getSponsorAnalytics: vi.fn().mockResolvedValue({ totalImpressions: 0 }),
  getSponsorClubs: vi.fn().mockResolvedValue([]),
  getSponsorAssets: vi.fn().mockReturnValue({ assetsStatus: 'PLANNED', assets: [] }),
  getBillingPlaceholder: vi.fn().mockReturnValue({
    billingStatus: 'INVOICE_ONLY',
    isFinancial: false,
    paymentProvider: null,
    adr: 'ADR-031',
  }),
});

describe('SponsorPortalController', () => {
  let controller: SponsorPortalController;
  let service: ReturnType<typeof makeService>;

  beforeEach(() => {
    service = makeService();
    controller = new SponsorPortalController(service as unknown as SponsorPortalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getSponsorOverview calls service with sponsorId', async () => {
    await controller.getSponsorOverview('sp-1');
    expect(service.getSponsorOverview).toHaveBeenCalledWith('sp-1');
  });

  it('getSponsorProfile calls service with sponsorId', async () => {
    await controller.getSponsorProfile('sp-1');
    expect(service.getSponsorProfile).toHaveBeenCalledWith('sp-1');
  });

  it('getSponsorCampaigns calls service with sponsorId', async () => {
    await controller.getSponsorCampaigns('sp-1');
    expect(service.getSponsorCampaigns).toHaveBeenCalledWith('sp-1');
  });

  it('createCampaignDraft calls service with dto, sponsorId, userId', async () => {
    const dto = { title: 'New Draft', startsAt: '2026-07-01', endsAt: '2026-08-01' };
    const req = { user: { userId: 'user-1' } };
    await controller.createCampaignDraft(dto, 'sp-1', req);
    expect(service.createCampaignDraft).toHaveBeenCalledWith(dto, 'sp-1', 'user-1');
  });

  it('getBillingPlaceholder returns INVOICE_ONLY', () => {
    const result = controller.getBillingPlaceholder();
    expect(result).toMatchObject({ billingStatus: 'INVOICE_ONLY', isFinancial: false });
  });

  it('getSponsorAudiences returns PLANNED placeholder', () => {
    const result = controller.getSponsorAudiences('sp-1');
    expect(result).toMatchObject({ audienceStatus: 'PLANNED' });
  });

  it('controller has SPONSOR and PSL_ADMIN roles metadata', () => {
    const roles = Reflect.getMetadata('roles', SponsorPortalController);
    expect(roles).toContain('SPONSOR');
    expect(roles).toContain('PSL_ADMIN');
  });

  it('getSponsorRewards calls service with sponsorId', async () => {
    await controller.getSponsorRewards('sp-1');
    expect(service.getSponsorRewards).toHaveBeenCalledWith('sp-1');
  });

  it('getSponsorAnalytics calls service with sponsorId', async () => {
    await controller.getSponsorAnalytics('sp-1');
    expect(service.getSponsorAnalytics).toHaveBeenCalledWith('sp-1');
  });

  it('getSponsorClubs calls service with sponsorId', async () => {
    await controller.getSponsorClubs('sp-1');
    expect(service.getSponsorClubs).toHaveBeenCalledWith('sp-1');
  });
});
