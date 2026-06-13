import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

const makeNotifications = () => ({
  createInAppNotification: vi.fn().mockResolvedValue(undefined),
});

const makeActivityFeed = () => ({
  createUserActivity: vi.fn().mockResolvedValue(undefined),
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = new Date('2026-06-01T12:00:00.000Z');

const CAMPAIGN = {
  id: 'campaign-1',
  slug: 'test-campaign',
  title: 'Test Campaign',
  status: 'DRAFT',
  startsAt: new Date('2026-01-01T00:00:00.000Z'),
  endsAt: new Date('2026-12-31T23:59:59.000Z'),
  requiresWalletLinked: false,
  requiresAgeConfirmation: false,
  maxParticipationsPerFan: null,
};

const PARTICIPATION = {
  id: 'part-1',
  campaignId: 'campaign-1',
  fanUserId: 'fan-1',
  status: 'STARTED',
  completedAt: null,
};

const ACTION = {
  id: 'action-1',
  campaignId: 'campaign-1',
  actionType: 'CLICK_CTA',
  isRequired: true,
};

const COMPLETION = {
  id: 'compl-1',
  participationId: 'part-1',
  campaignActionId: 'action-1',
  fanUserId: 'fan-1',
  validationStatus: 'VALID',
  idempotencyKey: 'key-abc',
};

// ---------------------------------------------------------------------------
// Prisma factory — fresh mocks every test
// ---------------------------------------------------------------------------

const makePrisma = () => ({
  sponsorCampaign: {
    findUnique: vi.fn().mockResolvedValue(CAMPAIGN),
    findFirst: vi.fn().mockResolvedValue(CAMPAIGN),
    findMany: vi.fn().mockResolvedValue([CAMPAIGN]),
    create: vi.fn().mockResolvedValue(CAMPAIGN),
    update: vi.fn().mockResolvedValue({ ...CAMPAIGN, status: 'PUBLISHED' }),
    count: vi.fn().mockResolvedValue(0),
  },
  campaignAction: {
    create: vi.fn().mockResolvedValue(ACTION),
    findMany: vi.fn().mockResolvedValue([ACTION]),
    findUnique: vi.fn().mockResolvedValue(ACTION),
    count: vi.fn().mockResolvedValue(1),
  },
  fanCampaignParticipation: {
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([PARTICIPATION]),
    create: vi.fn().mockResolvedValue(PARTICIPATION),
    update: vi.fn().mockResolvedValue({ ...PARTICIPATION, status: 'COMPLETED' }),
    count: vi.fn().mockResolvedValue(0),
  },
  fanCampaignActionCompletion: {
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(COMPLETION),
    count: vi.fn().mockResolvedValue(1),
    findMany: vi.fn().mockResolvedValue([{ campaignActionId: 'action-1' }]),
  },
  adminAuditLog: {
    create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
  },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CampaignsService', () => {
  let service: CampaignsService;
  let prisma: ReturnType<typeof makePrisma>;
  let notifications: ReturnType<typeof makeNotifications>;
  let activityFeed: ReturnType<typeof makeActivityFeed>;

  beforeEach(() => {
    prisma = makePrisma();
    notifications = makeNotifications();
    activityFeed = makeActivityFeed();
    service = new CampaignsService(prisma as any, notifications as any, activityFeed as any);
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // adminCreateCampaign
  // -------------------------------------------------------------------------

  describe('adminCreateCampaign', () => {
    it('creates campaign with status=DRAFT and writes AdminAuditLog', async () => {
      const dto = {
        title: 'Summer Sale',
        slug: 'summer-sale',
        startsAt: '2026-01-01',
        endsAt: '2026-12-31',
      };

      const result = await service.adminCreateCampaign(dto, 'admin-1');

      expect(prisma.sponsorCampaign.create).toHaveBeenCalledOnce();
      const createCall = prisma.sponsorCampaign.create.mock.calls[0]![0]!;
      expect(createCall.data.status).toBe('DRAFT');
      expect(prisma.adminAuditLog.create).toHaveBeenCalledOnce();
      const auditCall = prisma.adminAuditLog.create.mock.calls[0]![0]!;
      expect(auditCall.data.action).toBe('CAMPAIGN_CREATED');
      expect(result).toEqual(CAMPAIGN);
    });

    it('throws BadRequestException when endsAt is before startsAt', async () => {
      const dto = {
        title: 'Bad Dates',
        slug: 'bad-dates',
        startsAt: '2026-12-31',
        endsAt: '2026-01-01',
      };

      await expect(service.adminCreateCampaign(dto)).rejects.toThrow(BadRequestException);
      expect(prisma.sponsorCampaign.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when endsAt equals startsAt', async () => {
      const dto = {
        title: 'Equal Dates',
        slug: 'equal-dates',
        startsAt: '2026-06-01',
        endsAt: '2026-06-01',
      };

      await expect(service.adminCreateCampaign(dto)).rejects.toThrow(BadRequestException);
    });
  });

  // -------------------------------------------------------------------------
  // adminSubmitForApproval
  // -------------------------------------------------------------------------

  describe('adminSubmitForApproval', () => {
    it('transitions DRAFT → PENDING_APPROVAL successfully', async () => {
      prisma.sponsorCampaign.update.mockResolvedValue({ ...CAMPAIGN, status: 'PENDING_APPROVAL' });

      const result = await service.adminSubmitForApproval('campaign-1', 'admin-1');

      expect(prisma.sponsorCampaign.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'campaign-1' },
          data: { status: 'PENDING_APPROVAL' },
        }),
      );
      expect(result.status).toBe('PENDING_APPROVAL');
      expect(prisma.adminAuditLog.create).toHaveBeenCalledOnce();
    });

    it('throws BadRequestException on invalid transition from PUBLISHED', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'PUBLISHED' });

      await expect(service.adminSubmitForApproval('campaign-1')).rejects.toThrow(BadRequestException);
    });
  });

  // -------------------------------------------------------------------------
  // adminApproveCampaign
  // -------------------------------------------------------------------------

  describe('adminApproveCampaign', () => {
    it('transitions PENDING_APPROVAL → APPROVED and sets approvedAt', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'PENDING_APPROVAL' });
      prisma.sponsorCampaign.update.mockResolvedValue({
        ...CAMPAIGN,
        status: 'APPROVED',
        approvedAt: NOW,
        approvedByUserId: 'admin-1',
      });

      const result = await service.adminApproveCampaign('campaign-1', 'admin-1');

      const updateCall = prisma.sponsorCampaign.update.mock.calls[0]![0]!;
      expect(updateCall.data.status).toBe('APPROVED');
      expect(updateCall.data.approvedAt).toBeInstanceOf(Date);
      expect(updateCall.data.approvedByUserId).toBe('admin-1');
      expect(result.status).toBe('APPROVED');
      expect(prisma.adminAuditLog.create).toHaveBeenCalledOnce();
    });
  });

  // -------------------------------------------------------------------------
  // adminRejectCampaign
  // -------------------------------------------------------------------------

  describe('adminRejectCampaign', () => {
    it('transitions PENDING_APPROVAL → REJECTED and writes reason in audit log', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'PENDING_APPROVAL' });
      prisma.sponsorCampaign.update.mockResolvedValue({ ...CAMPAIGN, status: 'REJECTED' });

      await service.adminRejectCampaign('campaign-1', 'Violates policy', 'admin-1');

      const auditCall = prisma.adminAuditLog.create.mock.calls[0]![0]!;
      expect(auditCall.data.action).toBe('CAMPAIGN_REJECTED');
      expect(auditCall.data.metadata.reason).toBe('Violates policy');
    });
  });

  // -------------------------------------------------------------------------
  // adminPublishCampaign
  // -------------------------------------------------------------------------

  describe('adminPublishCampaign', () => {
    it('transitions APPROVED → PUBLISHED, sets publishedAt, validates endsAt in future', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'APPROVED' });
      prisma.sponsorCampaign.update.mockResolvedValue({ ...CAMPAIGN, status: 'PUBLISHED', publishedAt: NOW });

      const result = await service.adminPublishCampaign('campaign-1', 'admin-1');

      const updateCall = prisma.sponsorCampaign.update.mock.calls[0]![0]!;
      expect(updateCall.data.status).toBe('PUBLISHED');
      expect(updateCall.data.publishedAt).toBeInstanceOf(Date);
      expect(result.status).toBe('PUBLISHED');
    });

    it('throws BadRequestException when current time is past endsAt', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({
        ...CAMPAIGN,
        status: 'APPROVED',
        endsAt: new Date('2025-01-01T00:00:00.000Z'), // past
      });

      await expect(service.adminPublishCampaign('campaign-1')).rejects.toThrow(BadRequestException);
    });
  });

  // -------------------------------------------------------------------------
  // adminPauseCampaign
  // -------------------------------------------------------------------------

  describe('adminPauseCampaign', () => {
    it('transitions PUBLISHED → PAUSED and sets pausedAt', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'PUBLISHED' });
      prisma.sponsorCampaign.update.mockResolvedValue({ ...CAMPAIGN, status: 'PAUSED', pausedAt: NOW });

      const result = await service.adminPauseCampaign('campaign-1', 'admin-1');

      const updateCall = prisma.sponsorCampaign.update.mock.calls[0]![0]!;
      expect(updateCall.data.status).toBe('PAUSED');
      expect(updateCall.data.pausedAt).toBeInstanceOf(Date);
      expect(result.status).toBe('PAUSED');
    });
  });

  // -------------------------------------------------------------------------
  // adminCompleteCampaign
  // -------------------------------------------------------------------------

  describe('adminCompleteCampaign', () => {
    it('transitions PUBLISHED → COMPLETED and sets completedAt', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'PUBLISHED' });
      prisma.sponsorCampaign.update.mockResolvedValue({ ...CAMPAIGN, status: 'COMPLETED', completedAt: NOW });

      const result = await service.adminCompleteCampaign('campaign-1', 'admin-1');

      const updateCall = prisma.sponsorCampaign.update.mock.calls[0]![0]!;
      expect(updateCall.data.status).toBe('COMPLETED');
      expect(updateCall.data.completedAt).toBeInstanceOf(Date);
      expect(result.status).toBe('COMPLETED');
    });
  });

  // -------------------------------------------------------------------------
  // adminArchiveCampaign
  // -------------------------------------------------------------------------

  describe('adminArchiveCampaign', () => {
    it('transitions COMPLETED → ARCHIVED and sets archivedAt', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'COMPLETED' });
      prisma.sponsorCampaign.update.mockResolvedValue({ ...CAMPAIGN, status: 'ARCHIVED', archivedAt: NOW });

      const result = await service.adminArchiveCampaign('campaign-1', 'admin-1');

      const updateCall = prisma.sponsorCampaign.update.mock.calls[0]![0]!;
      expect(updateCall.data.status).toBe('ARCHIVED');
      expect(updateCall.data.archivedAt).toBeInstanceOf(Date);
      expect(result.status).toBe('ARCHIVED');
    });
  });

  // -------------------------------------------------------------------------
  // Invalid transition — error message format
  // -------------------------------------------------------------------------

  describe('invalid transition', () => {
    it('throws BadRequestException with message "Invalid status transition: X → Y"', async () => {
      // DRAFT cannot go to PUBLISHED directly
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'DRAFT' });

      await expect(service.adminPublishCampaign('campaign-1')).rejects.toThrow(
        'Invalid status transition: DRAFT → PUBLISHED',
      );
    });

    it('throws BadRequestException from REJECTED trying to go to APPROVED', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'REJECTED' });

      await expect(service.adminApproveCampaign('campaign-1')).rejects.toThrow(
        'Invalid status transition: REJECTED → APPROVED',
      );
    });
  });

  // -------------------------------------------------------------------------
  // listFanCampaigns
  // -------------------------------------------------------------------------

  describe('listFanCampaigns', () => {
    it('returns only PUBLISHED campaigns within the active time window', async () => {
      const publishedCampaign = { ...CAMPAIGN, status: 'PUBLISHED' };
      prisma.sponsorCampaign.findMany.mockResolvedValue([publishedCampaign]);

      const results = await service.listFanCampaigns();

      expect(prisma.sponsorCampaign.findMany).toHaveBeenCalledOnce();
      const where = prisma.sponsorCampaign.findMany.mock.calls[0]![0]!.where;
      expect(where.status).toBe('PUBLISHED');
      expect(where.startsAt).toHaveProperty('lte');
      expect(where.endsAt).toHaveProperty('gte');
      expect(results).toHaveLength(1);
      expect(results[0]!.status).toBe('PUBLISHED');
    });

    it('passes optional clubId and seasonId filters through', async () => {
      await service.listFanCampaigns({ clubId: 'club-1', seasonId: 'season-1' });

      const where = prisma.sponsorCampaign.findMany.mock.calls[0]![0]!.where;
      expect(where.clubId).toBe('club-1');
      expect(where.seasonId).toBe('season-1');
    });
  });

  // -------------------------------------------------------------------------
  // startParticipation
  // -------------------------------------------------------------------------

  describe('startParticipation', () => {
    it('creates a participation record when fan is not yet enrolled', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'PUBLISHED' });
      prisma.fanCampaignParticipation.findUnique.mockResolvedValue(null);
      prisma.fanCampaignParticipation.create.mockResolvedValue(PARTICIPATION);

      const result = await service.startParticipation('campaign-1', 'fan-1');

      expect(prisma.fanCampaignParticipation.create).toHaveBeenCalledOnce();
      expect(result.campaignId).toBe('campaign-1');
      expect(result.fanUserId).toBe('fan-1');
    });

    it('is idempotent — returns existing participation if already started', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'PUBLISHED' });
      prisma.fanCampaignParticipation.findUnique.mockResolvedValue(PARTICIPATION);

      const result = await service.startParticipation('campaign-1', 'fan-1');

      expect(prisma.fanCampaignParticipation.create).not.toHaveBeenCalled();
      expect(result).toEqual(PARTICIPATION);
    });

    it('throws BadRequestException when campaign is not PUBLISHED', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'DRAFT' });

      await expect(service.startParticipation('campaign-1', 'fan-1')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when requiresAgeConfirmation=true and ageConfirmed=false', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({
        ...CAMPAIGN,
        status: 'PUBLISHED',
        requiresAgeConfirmation: true,
      });

      await expect(service.startParticipation('campaign-1', 'fan-1', false)).rejects.toThrow(
        'Age confirmation is required',
      );
    });

    it('throws BadRequestException when maxParticipationsPerFan exceeded', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({
        ...CAMPAIGN,
        status: 'PUBLISHED',
        maxParticipationsPerFan: 1,
      });
      prisma.fanCampaignParticipation.count.mockResolvedValue(1);

      await expect(service.startParticipation('campaign-1', 'fan-1')).rejects.toThrow(
        'Maximum participations per fan exceeded',
      );
    });

    it('fires CAMPAIGN_STARTED notification and activity feed on new participation', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'PUBLISHED' });
      prisma.fanCampaignParticipation.findUnique.mockResolvedValue(null);
      prisma.fanCampaignParticipation.create.mockResolvedValue(PARTICIPATION);

      await service.startParticipation('campaign-1', 'fan-1');

      await vi.runAllTimersAsync();
      expect(notifications.createInAppNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'CAMPAIGN_STARTED', userId: 'fan-1' }),
      );
      expect(activityFeed.createUserActivity).toHaveBeenCalledWith(
        'fan-1',
        expect.objectContaining({ type: 'CAMPAIGN_STARTED' }),
      );
    });

    it('does NOT fire hooks when participation already exists (idempotent return)', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'PUBLISHED' });
      prisma.fanCampaignParticipation.findUnique.mockResolvedValue(PARTICIPATION);

      await service.startParticipation('campaign-1', 'fan-1');

      await vi.runAllTimersAsync();
      expect(notifications.createInAppNotification).not.toHaveBeenCalled();
      expect(activityFeed.createUserActivity).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // completeAction
  // -------------------------------------------------------------------------

  describe('completeAction', () => {
    const activeParticipation = { ...PARTICIPATION, campaignId: 'campaign-1' };
    const completedParticipation = { ...PARTICIPATION, status: 'COMPLETED', campaignId: 'campaign-1' };

    beforeEach(() => {
      prisma.fanCampaignParticipation.findUnique.mockResolvedValue(activeParticipation);
      prisma.campaignAction.findUnique.mockResolvedValue(ACTION);
      prisma.fanCampaignActionCompletion.findUnique.mockResolvedValue(null);
      // After completion: all required actions done
      prisma.campaignAction.findMany.mockResolvedValue([ACTION]);
      prisma.fanCampaignActionCompletion.findMany.mockResolvedValue([{ campaignActionId: 'action-1' }]);
    });

    it('creates FanCampaignActionCompletion with VALID validationStatus for CLICK_CTA action', async () => {
      const result = await service.completeAction('campaign-1', 'action-1', 'fan-1', {});

      expect(prisma.fanCampaignActionCompletion.create).toHaveBeenCalledOnce();
      const createData = prisma.fanCampaignActionCompletion.create.mock.calls[0]![0]!.data;
      expect(createData.validationStatus).toBe('VALID');
      expect((result as { validationStatus: string }).validationStatus).toBe('VALID');
    });

    it('sets MANUAL_REVIEW validationStatus for SCAN_QR action type', async () => {
      prisma.campaignAction.findUnique.mockResolvedValue({ ...ACTION, actionType: 'SCAN_QR' });
      prisma.fanCampaignActionCompletion.create.mockResolvedValue({
        ...COMPLETION,
        validationStatus: 'MANUAL_REVIEW',
      });

      const result = await service.completeAction('campaign-1', 'action-1', 'fan-1', {});

      const createData = prisma.fanCampaignActionCompletion.create.mock.calls[0]![0]!.data;
      expect(createData.validationStatus).toBe('MANUAL_REVIEW');
      expect((result as { validationStatus: string }).validationStatus).toBe('MANUAL_REVIEW');
    });

    it('is idempotent — returns existing completion with participation when idempotency key already used', async () => {
      // findUnique: first call = byKey match, second = participation re-fetch
      prisma.fanCampaignActionCompletion.findUnique
        .mockResolvedValueOnce(COMPLETION);
      prisma.fanCampaignParticipation.findUnique
        .mockResolvedValueOnce(activeParticipation)  // initial resolve
        .mockResolvedValueOnce(completedParticipation); // re-fetch inside idempotent branch

      const result = await service.completeAction('campaign-1', 'action-1', 'fan-1', {
        idempotencyKey: 'key-abc',
      }) as { completion: typeof COMPLETION; participation: typeof completedParticipation; idempotent: boolean };

      expect(prisma.fanCampaignActionCompletion.create).not.toHaveBeenCalled();
      expect(result.idempotent).toBe(true);
      expect(result.completion).toEqual(COMPLETION);
      expect(result.participation).toEqual(completedParticipation);
    });

    it('is idempotent — returns existing completion by (participationId, actionId) unique pair when no key provided', async () => {
      // findUnique for byKey = null (no key), byUnique = existing completion
      prisma.fanCampaignActionCompletion.findUnique
        .mockResolvedValueOnce(COMPLETION); // byUnique (no key so first call is byUnique)
      prisma.fanCampaignParticipation.findUnique
        .mockResolvedValueOnce(activeParticipation)
        .mockResolvedValueOnce(completedParticipation);

      const result = await service.completeAction('campaign-1', 'action-1', 'fan-1', {}) as {
        completion: typeof COMPLETION; idempotent: boolean;
      };

      expect(prisma.fanCampaignActionCompletion.create).not.toHaveBeenCalled();
      expect(result.idempotent).toBe(true);
      expect(result.completion).toEqual(COMPLETION);
    });

    it('returns idempotent response when participation is COMPLETED and same action repeated', async () => {
      prisma.fanCampaignParticipation.findUnique.mockResolvedValue(completedParticipation);
      prisma.fanCampaignActionCompletion.findUnique.mockResolvedValue(COMPLETION); // existing completion found
      prisma.fanCampaignParticipation.findUnique
        .mockResolvedValueOnce(completedParticipation)
        .mockResolvedValueOnce(completedParticipation);

      const result = await service.completeAction('campaign-1', 'action-1', 'fan-1', {}) as {
        idempotent: boolean;
      };

      expect(prisma.fanCampaignActionCompletion.create).not.toHaveBeenCalled();
      expect(result.idempotent).toBe(true);
    });

    it('throws BadRequestException for a NEW action when participation is in terminal COMPLETED status', async () => {
      // participation is COMPLETED, no existing completion for this action
      prisma.fanCampaignParticipation.findUnique.mockResolvedValue(completedParticipation);
      prisma.fanCampaignActionCompletion.findUnique.mockResolvedValue(null);

      await expect(
        service.completeAction('campaign-1', 'action-1', 'fan-1', {}),
      ).rejects.toThrow('Participation is in terminal status: COMPLETED');
    });

    it('does NOT create a duplicate completion row on repeated call', async () => {
      // First call: success (creates row)
      prisma.fanCampaignActionCompletion.findUnique.mockResolvedValue(null);
      await service.completeAction('campaign-1', 'action-1', 'fan-1', {});

      // Second call: idempotency check finds existing row
      prisma.fanCampaignActionCompletion.findUnique.mockResolvedValue(COMPLETION);
      prisma.fanCampaignParticipation.findUnique
        .mockResolvedValueOnce(activeParticipation)
        .mockResolvedValueOnce(completedParticipation);
      await service.completeAction('campaign-1', 'action-1', 'fan-1', {});

      // create should only have been called once total
      expect(prisma.fanCampaignActionCompletion.create).toHaveBeenCalledOnce();
    });

    it('fires CAMPAIGN_COMPLETED notification and activity when all required actions are done', async () => {
      prisma.fanCampaignActionCompletion.findUnique.mockResolvedValue(null);
      prisma.campaignAction.findMany.mockResolvedValue([ACTION]);
      prisma.fanCampaignActionCompletion.findMany.mockResolvedValue([{ campaignActionId: 'action-1' }]);

      await service.completeAction('campaign-1', 'action-1', 'fan-1', {});

      await vi.runAllTimersAsync();
      expect(notifications.createInAppNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'CAMPAIGN_COMPLETED', userId: 'fan-1' }),
      );
      expect(activityFeed.createUserActivity).toHaveBeenCalledWith(
        'fan-1',
        expect.objectContaining({ type: 'CAMPAIGN_COMPLETED' }),
      );
    });

    it('does NOT fire CAMPAIGN_COMPLETED hooks when not all required actions are done', async () => {
      prisma.fanCampaignActionCompletion.findUnique.mockResolvedValue(null);
      // Two required actions, only one completed
      prisma.campaignAction.findMany.mockResolvedValue([ACTION, { ...ACTION, id: 'action-2' }]);
      prisma.fanCampaignActionCompletion.findMany.mockResolvedValue([{ campaignActionId: 'action-1' }]);

      await service.completeAction('campaign-1', 'action-1', 'fan-1', {});

      await vi.runAllTimersAsync();
      expect(notifications.createInAppNotification).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // getProgress
  // -------------------------------------------------------------------------

  describe('getProgress', () => {
    it('returns null when participation does not exist', async () => {
      prisma.fanCampaignParticipation.findUnique.mockResolvedValue(null);

      const result = await service.getProgress('campaign-1', 'fan-1');

      expect(result).toBeNull();
    });

    it('returns progress object with percentage when participation exists', async () => {
      prisma.fanCampaignParticipation.findUnique.mockResolvedValue(PARTICIPATION);
      prisma.campaignAction.count.mockResolvedValue(2);
      prisma.fanCampaignActionCompletion.count.mockResolvedValue(1);

      const result = await service.getProgress('campaign-1', 'fan-1');

      expect(result).not.toBeNull();
      expect(result!.participationId).toBe('part-1');
      expect(result!.totalRequiredActions).toBe(2);
      expect(result!.completedActions).toBe(1);
      expect(result!.percentage).toBe(50);
    });
  });

  // -------------------------------------------------------------------------
  // getCampaignOrThrow — NotFoundException
  // -------------------------------------------------------------------------

  describe('getCampaignOrThrow', () => {
    it('throws NotFoundException when campaign does not exist', async () => {
      prisma.sponsorCampaign.findUnique.mockResolvedValue(null);

      await expect(service.adminSubmitForApproval('missing-id')).rejects.toThrow(NotFoundException);
    });
  });
});
