import { Injectable, NotFoundException } from '@nestjs/common';
import { SponsorStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateSponsorDto {
  name: string;
  slug: string;
  sector?: string;
  logoUrl?: string;
  websiteUrl?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  status?: string;
}

export interface UpdateSponsorDto {
  name?: string;
  slug?: string;
  sector?: string;
  logoUrl?: string;
  websiteUrl?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  status?: string;
}

const PUBLIC_SPONSOR_SELECT = {
  id: true,
  name: true,
  slug: true,
  sector: true,
  logoUrl: true,
  websiteUrl: true,
  status: true,
} as const;

@Injectable()
export class SponsorsService {
  constructor(private readonly prisma: PrismaService) {}

  async adminListSponsors() {
    return this.prisma.sponsor.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async adminGetSponsor(id: string) {
    const sponsor = await this.prisma.sponsor.findUnique({ where: { id } });
    if (!sponsor) throw new NotFoundException(`Sponsor not found: ${id}`);
    return sponsor;
  }

  async adminCreateSponsor(dto: CreateSponsorDto, actorUserId?: string) {
    const sponsor = await this.prisma.sponsor.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        ...(dto.sector !== undefined ? { sector: dto.sector } : {}),
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
        ...(dto.websiteUrl !== undefined ? { websiteUrl: dto.websiteUrl } : {}),
        ...(dto.primaryContactName !== undefined ? { primaryContactName: dto.primaryContactName } : {}),
        ...(dto.primaryContactEmail !== undefined ? { primaryContactEmail: dto.primaryContactEmail } : {}),
        ...(dto.status !== undefined ? { status: dto.status as SponsorStatus } : {}),
      },
    });

    await this.writeAuditLog('SPONSOR_CREATED', 'Sponsor', sponsor.id, actorUserId);
    return sponsor;
  }

  async adminUpdateSponsor(id: string, dto: UpdateSponsorDto, actorUserId?: string) {
    await this.adminGetSponsor(id);

    const data: Prisma.SponsorUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.sector !== undefined) data.sector = dto.sector;
    if (dto.logoUrl !== undefined) data.logoUrl = dto.logoUrl;
    if (dto.websiteUrl !== undefined) data.websiteUrl = dto.websiteUrl;
    if (dto.primaryContactName !== undefined) data.primaryContactName = dto.primaryContactName;
    if (dto.primaryContactEmail !== undefined) data.primaryContactEmail = dto.primaryContactEmail;
    if (dto.status !== undefined) data.status = dto.status as SponsorStatus;

    const updated = await this.prisma.sponsor.update({ where: { id }, data });

    await this.writeAuditLog('SPONSOR_UPDATED', 'Sponsor', id, actorUserId);
    return updated;
  }

  async getPublicSponsor(id: string) {
    const sponsor = await this.prisma.sponsor.findUnique({
      where: { id },
      select: PUBLIC_SPONSOR_SELECT,
    });
    if (!sponsor) throw new NotFoundException(`Sponsor not found: ${id}`);
    return sponsor;
  }

  async listPublicSponsors() {
    return this.prisma.sponsor.findMany({
      where: { status: SponsorStatus.ACTIVE },
      select: PUBLIC_SPONSOR_SELECT,
      orderBy: { name: 'asc' },
    });
  }

  private async writeAuditLog(
    action: string,
    entityType: string,
    entityId: string,
    actorUserId?: string,
  ) {
    await this.prisma.adminAuditLog.create({
      data: {
        actorRole: 'PSL_ADMIN',
        action,
        entityType,
        entityId,
        route: `/admin/sponsors`,
        metadata: Prisma.JsonNull,
        ...(actorUserId !== undefined ? { actorUserId } : {}),
      },
    });
  }
}
