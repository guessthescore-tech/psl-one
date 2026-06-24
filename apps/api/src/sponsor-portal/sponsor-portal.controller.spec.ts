import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SponsorPortalController } from './sponsor-portal.controller';
import type { SponsorPortalService } from './sponsor-portal.service';

const makeService = () => ({
  getSponsorOverview: vi.fn().mockResolvedValue({ sponsorId: 'sp-1', campaignCount: 0 }),
  getSponsorProfile: vi.fn().mockResolvedValue({ id: 'sp-1', name: 'Nike' }),
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

describe('SponsorPortalController (Sprint 28 — req.user scoping)', () => {
  let controller: SponsorPortalController;
  let service: ReturnType<typeof makeService>;

  const mockReq = { user: { sub: 'user-1', role: 'SPONSOR' } };
  const mockAdminReq = { user: { sub: 'admin-1', role: 'PSL_ADMIN' } };

  beforeEach(() => {
    service = makeService();
    controller = new SponsorPortalController(service as unknown as SponsorPortalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getSponsorOverview passes req.user.sub and role to service', async () => {
    await controller.getSponsorOverview(mockReq, 'sp-1');
    expect(service.getSponsorOverview).toHaveBeenCalledWith('user-1', 'SPONSOR', 'sp-1');
  });

  it('getSponsorProfile passes req.user.sub and role to service', async () => {
    await controller.getSponsorProfile(mockReq, 'sp-1');
    expect(service.getSponsorProfile).toHaveBeenCalledWith('user-1', 'SPONSOR', 'sp-1');
  });

  it('getSponsorCampaigns passes req.user.sub and role to service', async () => {
    await controller.getSponsorCampaigns(mockReq, 'sp-1');
    expect(service.getSponsorCampaigns).toHaveBeenCalledWith('user-1', 'SPONSOR', 'sp-1');
  });

  it('createCampaignDraft passes dto, req.user.sub, role, sponsorId', async () => {
    const dto = { title: 'New Draft', startsAt: '2026-07-01', endsAt: '2026-08-01' };
    await controller.createCampaignDraft(dto, mockReq, 'sp-1');
    expect(service.createCampaignDraft).toHaveBeenCalledWith(dto, 'user-1', 'SPONSOR', 'sp-1');
  });

  it('PSL_ADMIN can pass explicit sponsorId', async () => {
    await controller.getSponsorOverview(mockAdminReq, 'explicit-sp-id');
    expect(service.getSponsorOverview).toHaveBeenCalledWith('admin-1', 'PSL_ADMIN', 'explicit-sp-id');
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

  it('getSponsorRewards passes req.user.sub and role', async () => {
    await controller.getSponsorRewards(mockReq, 'sp-1');
    expect(service.getSponsorRewards).toHaveBeenCalledWith('user-1', 'SPONSOR', 'sp-1');
  });

  it('getSponsorAnalytics passes req.user.sub and role', async () => {
    await controller.getSponsorAnalytics(mockReq, 'sp-1');
    expect(service.getSponsorAnalytics).toHaveBeenCalledWith('user-1', 'SPONSOR', 'sp-1');
  });

  it('getSponsorClubs passes req.user.sub and role', async () => {
    await controller.getSponsorClubs(mockReq, 'sp-1');
    expect(service.getSponsorClubs).toHaveBeenCalledWith('user-1', 'SPONSOR', 'sp-1');
  });
});
