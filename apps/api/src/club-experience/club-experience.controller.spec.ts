import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClubExperienceController } from './club-experience.controller';
import { ClubExperienceService } from './club-experience.service';
import { ClubAdminService } from './club-admin.service';

const makeFanServiceMock = () => ({
  getClubs: vi.fn().mockResolvedValue([]),
  getClubBySlug: vi.fn().mockResolvedValue({ id: 'team-1' }),
  getClubOverview: vi.fn().mockResolvedValue({ id: 'team-1' }),
  getClubFixtures: vi.fn().mockResolvedValue([]),
  getClubResults: vi.fn().mockResolvedValue([]),
  getClubSquad: vi.fn().mockResolvedValue({ grouped: {} }),
  getClubStats: vi.fn().mockResolvedValue({}),
  getClubStadium: vi.fn().mockResolvedValue({}),
  getClubTickets: vi.fn().mockResolvedValue({ status: 'NOT_ENABLED' }),
  getClubShop: vi.fn().mockResolvedValue({ products: [] }),
  getClubShopProduct: vi.fn().mockResolvedValue({ id: 'prod-1' }),
});

const makeAdminServiceMock = () => ({
  getAdminClubList: vi.fn().mockResolvedValue([]),
  getClubReadiness: vi.fn().mockResolvedValue({ totalClubs: 0 }),
  getUnassignedFixtures: vi.fn().mockResolvedValue([]),
  getUnassignedPlayers: vi.fn().mockResolvedValue([]),
  getAdminClubDetail: vi.fn().mockResolvedValue({ id: 'team-1' }),
  getAdminClubExperience: vi.fn().mockResolvedValue({}),
  getClubPlayers: vi.fn().mockResolvedValue([]),
  getAdminClubShopReadiness: vi.fn().mockResolvedValue({}),
  getClubFixturesForAdmin: vi.fn().mockResolvedValue([]),
  validateClubDataQuality: vi.fn().mockResolvedValue({ readiness: 'NOT_READY' }),
  getSeasonTeams: vi.fn().mockResolvedValue([]),
  addTeamToSeason: vi.fn().mockResolvedValue({}),
  updateSeasonTeamStatus: vi.fn().mockResolvedValue({}),
  removeTeamFromSeason: vi.fn().mockResolvedValue({ removed: true }),
  validateSeasonParticipation: vi.fn().mockResolvedValue({ readiness: 'NOT_READY' }),
  validateFixtureReadiness: vi.fn().mockResolvedValue({ readiness: 'NOT_READY' }),
  assignPlayerToClub: vi.fn().mockResolvedValue({}),
  updatePlayerAssignment: vi.fn().mockResolvedValue({}),
  removePlayerFromClub: vi.fn().mockResolvedValue({ removed: true }),
  movePlayerToClub: vi.fn().mockResolvedValue({ moved: true }),
  validateSquadCompleteness: vi.fn().mockResolvedValue({ readiness: 'NOT_READY' }),
  assignFixtureTeams: vi.fn().mockResolvedValue({}),
  assignFixtureVenue: vi.fn().mockResolvedValue({}),
  assignFixtureGameweek: vi.fn().mockResolvedValue({}),
  updateFixtureAssignmentStatus: vi.fn().mockResolvedValue({}),
});

describe('ClubExperienceController', () => {
  let controller: ClubExperienceController;
  let fanService: ReturnType<typeof makeFanServiceMock>;
  let adminService: ReturnType<typeof makeAdminServiceMock>;

  beforeEach(() => {
    fanService = makeFanServiceMock();
    adminService = makeAdminServiceMock();
    controller = new ClubExperienceController(
      fanService as unknown as ClubExperienceService,
      adminService as unknown as ClubAdminService,
    );
  });

  // ── Fan routes ─────────────────────────────────────────────────────────────

  it('getClubs calls fanService.getClubs', async () => {
    await controller.getClubs();
    expect(fanService.getClubs).toHaveBeenCalledWith(undefined);
  });

  it('getClubs passes season query param', async () => {
    await controller.getClubs('psl-premiership-upcoming');
    expect(fanService.getClubs).toHaveBeenCalledWith('psl-premiership-upcoming');
  });

  it('getClubOverview delegates to fanService', async () => {
    await controller.getClubOverview('mamelodi-sundowns');
    expect(fanService.getClubOverview).toHaveBeenCalledWith('mamelodi-sundowns');
  });

  it('getClubFixtures delegates to fanService', async () => {
    await controller.getClubFixtures('kaizer-chiefs');
    expect(fanService.getClubFixtures).toHaveBeenCalledWith('kaizer-chiefs');
  });

  it('getClubResults delegates to fanService', async () => {
    await controller.getClubResults('orlando-pirates');
    expect(fanService.getClubResults).toHaveBeenCalledWith('orlando-pirates');
  });

  it('getClubSquad delegates to fanService', async () => {
    await controller.getClubSquad('mamelodi-sundowns');
    expect(fanService.getClubSquad).toHaveBeenCalledWith('mamelodi-sundowns');
  });

  it('getClubStats delegates to fanService', async () => {
    await controller.getClubStats('mamelodi-sundowns');
    expect(fanService.getClubStats).toHaveBeenCalledWith('mamelodi-sundowns');
  });

  it('getClubStadium delegates to fanService', async () => {
    await controller.getClubStadium('mamelodi-sundowns');
    expect(fanService.getClubStadium).toHaveBeenCalledWith('mamelodi-sundowns');
  });

  it('getClubTickets returns MVP stub', async () => {
    const result = await controller.getClubTickets('mamelodi-sundowns');
    expect(fanService.getClubTickets).toHaveBeenCalled();
    expect((result as Record<string, unknown>)['status']).toBe('NOT_ENABLED');
  });

  it('getClubShop delegates to fanService', async () => {
    await controller.getClubShop('mamelodi-sundowns');
    expect(fanService.getClubShop).toHaveBeenCalledWith('mamelodi-sundowns');
  });

  it('getClubShopProduct delegates to fanService', async () => {
    await controller.getClubShopProduct('mamelodi-sundowns', 'home-kit-2025');
    expect(fanService.getClubShopProduct).toHaveBeenCalledWith('mamelodi-sundowns', 'home-kit-2025');
  });

  it('getClubBySlug delegates to fanService', async () => {
    await controller.getClubBySlug('mamelodi-sundowns');
    expect(fanService.getClubBySlug).toHaveBeenCalledWith('mamelodi-sundowns');
  });

  // ── Admin routes ───────────────────────────────────────────────────────────

  it('getAdminClubList delegates to adminService', async () => {
    await controller.getAdminClubList();
    expect(adminService.getAdminClubList).toHaveBeenCalled();
  });

  it('getClubReadiness delegates to adminService', async () => {
    await controller.getClubReadiness();
    expect(adminService.getClubReadiness).toHaveBeenCalled();
  });

  it('getSeasonTeams delegates to adminService', async () => {
    await controller.getSeasonTeams('season-1');
    expect(adminService.getSeasonTeams).toHaveBeenCalledWith('season-1');
  });

  it('addTeamToSeason delegates to adminService', async () => {
    await controller.addTeamToSeason('season-1', { teamId: 'team-1' });
    expect(adminService.addTeamToSeason).toHaveBeenCalledWith('season-1', { teamId: 'team-1' });
  });

  it('assignPlayerToClub delegates to adminService', async () => {
    await controller.assignPlayerToClub('team-1', 'season-1', { playerId: 'player-1' });
    expect(adminService.assignPlayerToClub).toHaveBeenCalledWith('team-1', 'season-1', { playerId: 'player-1' });
  });

  it('assignFixtureTeams delegates to adminService', async () => {
    await controller.assignFixtureTeams('fix-1', { homeTeamId: 't1', awayTeamId: 't2' });
    expect(adminService.assignFixtureTeams).toHaveBeenCalledWith('fix-1', { homeTeamId: 't1', awayTeamId: 't2' });
  });

  it('validateClubDataQuality delegates to adminService', async () => {
    await controller.validateClubDataQuality('team-1');
    expect(adminService.validateClubDataQuality).toHaveBeenCalledWith('team-1');
  });
});
