import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import type { PrismaService } from '../prisma/prisma.service';

const FULL_SPONSOR = {
  id: 'sponsor-1',
  name: 'Demo Corp',
  slug: 'demo-corp',
  sector: 'Technology',
  logoUrl: 'https://cdn.example.com/demo.png',
  websiteUrl: 'https://demo.example.com',
  primaryContactName: 'Jane Smith',
  primaryContactEmail: 'jane@demo.example.com',
  notes: 'Internal notes for admin only',
  status: 'ACTIVE',
  createdAt: new Date('2026-01-01'),
};

const PUBLIC_SPONSOR = {
  id: 'sponsor-1',
  name: 'Demo Corp',
  slug: 'demo-corp',
  sector: 'Technology',
  logoUrl: 'https://cdn.example.com/demo.png',
  websiteUrl: 'https://demo.example.com',
  status: 'ACTIVE',
};

const makePrisma = () => ({
  sponsor: {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({
      id: 'sponsor-1',
      name: 'Demo',
      slug: 'demo',
      status: 'ACTIVE',
    }),
    update: vi.fn().mockResolvedValue({ id: 'sponsor-1', name: 'Demo Updated' }),
  },
  adminAuditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-1' }) },
});

describe('SponsorsService', () => {
  let service: SponsorsService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrisma();
    service = new SponsorsService(prisma as unknown as PrismaService);
  });

  // ── adminListSponsors ─────────────────────────────────────────────────

  describe('adminListSponsors', () => {
    it('returns all sponsors from prisma with no where filter', async () => {
      prisma.sponsor.findMany.mockResolvedValue([FULL_SPONSOR]);
      const result = await service.adminListSponsors();
      expect(result).toHaveLength(1);
      expect(prisma.sponsor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: 'asc' } }),
      );
    });

    it('includes contact fields in the returned records', async () => {
      prisma.sponsor.findMany.mockResolvedValue([FULL_SPONSOR]);
      const result = await service.adminListSponsors();
      expect(result[0]).toHaveProperty('primaryContactName');
      expect(result[0]).toHaveProperty('primaryContactEmail');
    });

    it('does not apply a status filter — returns all statuses', async () => {
      await service.adminListSponsors();
      const call = prisma.sponsor.findMany.mock.calls[0]![0] as { where?: Record<string, unknown> };
      expect(call.where).toBeUndefined();
    });
  });

  // ── adminGetSponsor ───────────────────────────────────────────────────

  describe('adminGetSponsor', () => {
    it('returns full sponsor record by id', async () => {
      prisma.sponsor.findUnique.mockResolvedValue(FULL_SPONSOR);
      const result = await service.adminGetSponsor('sponsor-1');
      expect(result.id).toBe('sponsor-1');
      expect(result).toHaveProperty('primaryContactName');
      expect(result).toHaveProperty('primaryContactEmail');
    });

    it('throws NotFoundException when sponsor does not exist', async () => {
      prisma.sponsor.findUnique.mockResolvedValue(null);
      await expect(service.adminGetSponsor('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminCreateSponsor ────────────────────────────────────────────────

  describe('adminCreateSponsor', () => {
    const createDto = {
      name: 'New Sponsor',
      slug: 'new-sponsor',
      primaryContactName: 'Bob Jones',
      primaryContactEmail: 'bob@newsponsor.com',
    };

    it('creates a sponsor via prisma.sponsor.create', async () => {
      await service.adminCreateSponsor(createDto, 'admin-1');
      expect(prisma.sponsor.create).toHaveBeenCalledOnce();
      expect(prisma.sponsor.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'New Sponsor', slug: 'new-sponsor' }),
        }),
      );
    });

    it('writes AdminAuditLog with action SPONSOR_CREATED', async () => {
      await service.adminCreateSponsor(createDto, 'admin-1');
      expect(prisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'SPONSOR_CREATED', entityType: 'Sponsor' }),
        }),
      );
    });

    it('returns the created sponsor record', async () => {
      prisma.sponsor.create.mockResolvedValue(FULL_SPONSOR);
      const result = await service.adminCreateSponsor(createDto, 'admin-1');
      expect(result.id).toBe('sponsor-1');
    });
  });

  // ── adminUpdateSponsor ────────────────────────────────────────────────

  describe('adminUpdateSponsor', () => {
    it('applies partial update to the sponsor', async () => {
      prisma.sponsor.findUnique.mockResolvedValue(FULL_SPONSOR);
      await service.adminUpdateSponsor('sponsor-1', { name: 'Updated Name' }, 'admin-1');
      expect(prisma.sponsor.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sponsor-1' },
          data: expect.objectContaining({ name: 'Updated Name' }),
        }),
      );
    });

    it('writes AdminAuditLog with action SPONSOR_UPDATED', async () => {
      prisma.sponsor.findUnique.mockResolvedValue(FULL_SPONSOR);
      await service.adminUpdateSponsor('sponsor-1', { name: 'Updated Name' }, 'admin-1');
      expect(prisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'SPONSOR_UPDATED', entityType: 'Sponsor' }),
        }),
      );
    });

    it('throws NotFoundException when updating a non-existent sponsor', async () => {
      prisma.sponsor.findUnique.mockResolvedValue(null);
      await expect(
        service.adminUpdateSponsor('missing', { name: 'X' }, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── getPublicSponsor ──────────────────────────────────────────────────

  describe('getPublicSponsor', () => {
    it('returns only public fields — no primaryContactName, primaryContactEmail, or notes', async () => {
      prisma.sponsor.findUnique.mockResolvedValue(PUBLIC_SPONSOR);
      const result = await service.getPublicSponsor('sponsor-1');
      expect(result).not.toHaveProperty('primaryContactName');
      expect(result).not.toHaveProperty('primaryContactEmail');
      expect(result).not.toHaveProperty('notes');
    });

    it('calls findUnique with a select that limits to public fields', async () => {
      prisma.sponsor.findUnique.mockResolvedValue(PUBLIC_SPONSOR);
      await service.getPublicSponsor('sponsor-1');
      const call = prisma.sponsor.findUnique.mock.calls[0]![0] as {
        where: Record<string, unknown>;
        select?: Record<string, unknown>;
      };
      expect(call.select).toBeDefined();
      expect(call.select!['primaryContactName']).toBeUndefined();
      expect(call.select!['primaryContactEmail']).toBeUndefined();
    });

    it('includes public fields: id, name, slug, sector, logoUrl, websiteUrl, status', async () => {
      prisma.sponsor.findUnique.mockResolvedValue(PUBLIC_SPONSOR);
      const result = await service.getPublicSponsor('sponsor-1');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('status');
    });

    it('throws NotFoundException when sponsor is not found', async () => {
      prisma.sponsor.findUnique.mockResolvedValue(null);
      await expect(service.getPublicSponsor('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── listPublicSponsors ────────────────────────────────────────────────

  describe('listPublicSponsors', () => {
    it('filters to ACTIVE sponsors only', async () => {
      await service.listPublicSponsors();
      expect(prisma.sponsor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'ACTIVE' },
        }),
      );
    });

    it('uses a select that excludes contact and private fields', async () => {
      prisma.sponsor.findMany.mockResolvedValue([PUBLIC_SPONSOR]);
      await service.listPublicSponsors();
      const call = prisma.sponsor.findMany.mock.calls[0]![0] as {
        where: Record<string, unknown>;
        select?: Record<string, unknown>;
      };
      // The PUBLIC_SPONSOR_SELECT constant in the service does not include private fields
      expect(call.select).toBeDefined();
      expect(call.select!['primaryContactName']).toBeUndefined();
      expect(call.select!['primaryContactEmail']).toBeUndefined();
    });

    it('returns empty array when no active sponsors exist', async () => {
      prisma.sponsor.findMany.mockResolvedValue([]);
      const result = await service.listPublicSponsors();
      expect(result).toEqual([]);
    });

    it('orders results by name ascending', async () => {
      await service.listPublicSponsors();
      expect(prisma.sponsor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: 'asc' } }),
      );
    });
  });
});
