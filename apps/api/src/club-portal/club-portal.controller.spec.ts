import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClubPortalController } from './club-portal.controller';
import type { ClubPortalService } from './club-portal.service';

const makeService = () => ({
  getClubOverview: vi.fn().mockResolvedValue({ playerCount: 0, recentFixtures: [] }),
  getClubProfile: vi.fn().mockResolvedValue({ id: 'club-1', name: 'Test FC' }),
  getClubSquad: vi.fn().mockResolvedValue([]),
  getClubFixtures: vi.fn().mockResolvedValue([]),
  getClubFans: vi.fn().mockReturnValue({ fanCount: 0, fans: [], note: 'future feature' }),
  getClubAnalytics: vi.fn().mockResolvedValue({ playerCount: 0, fixtureCount: 0, contentCount: 0 }),
  getClubCampaigns: vi.fn().mockResolvedValue([]),
  getClubSponsors: vi.fn().mockResolvedValue([]),
  getClubContent: vi.fn().mockResolvedValue([]),
  submitContent: vi.fn().mockResolvedValue({ id: 'ct-new', status: 'DRAFT' }),
});

describe('ClubPortalController (Sprint 28 — req.user scoping)', () => {
  let controller: ClubPortalController;
  let service: ReturnType<typeof makeService>;

  const mockReq = { user: { sub: 'user-1', role: 'CLUB_ADMIN' } };
  const mockAdminReq = { user: { sub: 'admin-1', role: 'PSL_ADMIN' } };

  beforeEach(() => {
    service = makeService();
    controller = new ClubPortalController(service as unknown as ClubPortalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getClubOverview passes req.user.sub and role to service', async () => {
    await controller.getClubOverview(mockReq, 'club-1');
    expect(service.getClubOverview).toHaveBeenCalledWith('user-1', 'CLUB_ADMIN', 'club-1');
  });

  it('getClubProfile passes req.user.sub and role to service', async () => {
    await controller.getClubProfile(mockReq, 'club-1');
    expect(service.getClubProfile).toHaveBeenCalledWith('user-1', 'CLUB_ADMIN', 'club-1');
  });

  it('getClubSquad passes req.user.sub and role to service', async () => {
    await controller.getClubSquad(mockReq, 'club-1');
    expect(service.getClubSquad).toHaveBeenCalledWith('user-1', 'CLUB_ADMIN', 'club-1');
  });

  it('getClubFixtures passes req.user.sub and role to service', async () => {
    await controller.getClubFixtures(mockReq, 'club-1');
    expect(service.getClubFixtures).toHaveBeenCalledWith('user-1', 'CLUB_ADMIN', 'club-1');
  });

  it('getClubFans returns fans placeholder', () => {
    const result = controller.getClubFans(undefined);
    expect(result).toMatchObject({ fanCount: 0, fans: [] });
  });

  it('getClubAnalytics passes req.user.sub and role to service', async () => {
    await controller.getClubAnalytics(mockReq, 'club-1');
    expect(service.getClubAnalytics).toHaveBeenCalledWith('user-1', 'CLUB_ADMIN', 'club-1');
  });

  it('getClubCampaigns passes req.user.sub and role to service', async () => {
    await controller.getClubCampaigns(mockReq, 'club-1');
    expect(service.getClubCampaigns).toHaveBeenCalledWith('user-1', 'CLUB_ADMIN', 'club-1');
  });

  it('getClubContent passes req.user.sub and role to service', async () => {
    await controller.getClubContent(mockReq, 'club-1');
    expect(service.getClubContent).toHaveBeenCalledWith('user-1', 'CLUB_ADMIN', 'club-1');
  });

  it('submitContent passes dto, req.user.sub, role to service', async () => {
    const dto = { title: 'Test', contentType: 'news' };
    await controller.submitContent(dto, mockReq, 'club-1');
    expect(service.submitContent).toHaveBeenCalledWith(dto, 'user-1', 'CLUB_ADMIN', 'club-1');
  });

  it('PSL_ADMIN can pass explicit teamId', async () => {
    await controller.getClubOverview(mockAdminReq, 'explicit-team-id');
    expect(service.getClubOverview).toHaveBeenCalledWith('admin-1', 'PSL_ADMIN', 'explicit-team-id');
  });

  it('controller has CLUB_ADMIN and PSL_ADMIN roles metadata', () => {
    const roles = Reflect.getMetadata('roles', ClubPortalController);
    expect(roles).toContain('CLUB_ADMIN');
    expect(roles).toContain('PSL_ADMIN');
  });
});
