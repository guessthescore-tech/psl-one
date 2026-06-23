import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClubPortalController } from './club-portal.controller';
import type { ClubPortalService } from './club-portal.service';

const makeService = () => ({
  getClubOverview: vi.fn().mockResolvedValue({ scopeStatus: 'API_SCOPE_PENDING' }),
  getClubProfile: vi.fn().mockResolvedValue({ scopeStatus: 'API_SCOPE_PENDING' }),
  getClubSquad: vi.fn().mockResolvedValue({ scopeStatus: 'API_SCOPE_PENDING' }),
  getClubFixtures: vi.fn().mockResolvedValue({ scopeStatus: 'API_SCOPE_PENDING' }),
  getClubFans: vi.fn().mockReturnValue({ fanCount: 0, fans: [], note: 'pending' }),
  getClubAnalytics: vi.fn().mockResolvedValue({ scopeStatus: 'API_SCOPE_PENDING' }),
  getClubCampaigns: vi.fn().mockResolvedValue({ scopeStatus: 'API_SCOPE_PENDING' }),
  getClubSponsors: vi.fn().mockResolvedValue({ scopeStatus: 'API_SCOPE_PENDING' }),
  getClubContent: vi.fn().mockResolvedValue({ scopeStatus: 'API_SCOPE_PENDING' }),
  submitContent: vi.fn().mockResolvedValue({ id: 'ct-new', status: 'DRAFT' }),
});

describe('ClubPortalController', () => {
  let controller: ClubPortalController;
  let service: ReturnType<typeof makeService>;

  beforeEach(() => {
    service = makeService();
    controller = new ClubPortalController(service as unknown as ClubPortalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getClubOverview calls service with clubId', async () => {
    await controller.getClubOverview('club-1');
    expect(service.getClubOverview).toHaveBeenCalledWith('club-1');
  });

  it('getClubProfile calls service with clubId', async () => {
    await controller.getClubProfile('club-1');
    expect(service.getClubProfile).toHaveBeenCalledWith('club-1');
  });

  it('getClubSquad calls service with clubId', async () => {
    await controller.getClubSquad('club-1');
    expect(service.getClubSquad).toHaveBeenCalledWith('club-1');
  });

  it('getClubFixtures calls service with clubId', async () => {
    await controller.getClubFixtures('club-1');
    expect(service.getClubFixtures).toHaveBeenCalledWith('club-1');
  });

  it('getClubFans returns fans placeholder', () => {
    const result = controller.getClubFans(undefined);
    expect(result).toMatchObject({ fanCount: 0, fans: [] });
  });

  it('getClubAnalytics calls service with clubId', async () => {
    await controller.getClubAnalytics('club-1');
    expect(service.getClubAnalytics).toHaveBeenCalledWith('club-1');
  });

  it('getClubCampaigns calls service with clubId', async () => {
    await controller.getClubCampaigns('club-1');
    expect(service.getClubCampaigns).toHaveBeenCalledWith('club-1');
  });

  it('getClubContent calls service with clubId', async () => {
    await controller.getClubContent('club-1');
    expect(service.getClubContent).toHaveBeenCalledWith('club-1');
  });

  it('submitContent calls service with dto, clubId, userId', async () => {
    const dto = { title: 'Test', contentType: 'news' };
    const req = { user: { userId: 'user-1' } };
    await controller.submitContent(dto, 'club-1', req);
    expect(service.submitContent).toHaveBeenCalledWith(dto, 'club-1', 'user-1');
  });

  it('controller has CLUB_ADMIN and PSL_ADMIN roles metadata', () => {
    const roles = Reflect.getMetadata('roles', ClubPortalController);
    expect(roles).toContain('CLUB_ADMIN');
    expect(roles).toContain('PSL_ADMIN');
  });
});
