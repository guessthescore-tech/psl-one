import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuditEvent, DeletionRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeletionRequestDto } from './dto/create-deletion-request.dto';

@Injectable()
export class AccountDeletionService {
  constructor(private prisma: PrismaService) {}

  async requestDeletion(userId: string, dto: CreateDeletionRequestDto) {
    await this.assertUserActive(userId);

    const existing = await this.prisma.accountDeletionRequest.findFirst({
      where: { userId, status: DeletionRequestStatus.PENDING },
    });

    if (existing) {
      return { id: existing.id, status: existing.status, requestedAt: existing.requestedAt };
    }

    const request = await this.prisma.accountDeletionRequest.create({
      data: { userId, reason: dto.reason ?? null },
    });

    await this.writeAuditLog(userId, AuditEvent.ACCOUNT_DELETION_REQUESTED);

    return { id: request.id, status: request.status, requestedAt: request.requestedAt };
  }

  async getStatus(userId: string) {
    await this.assertUserActive(userId);

    const request = await this.prisma.accountDeletionRequest.findFirst({
      where: { userId, status: DeletionRequestStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });

    if (!request) return { hasPendingRequest: false, request: null };

    return {
      hasPendingRequest: true,
      request: {
        id: request.id,
        status: request.status,
        requestedAt: request.requestedAt,
        reason: request.reason,
      },
    };
  }

  async cancelRequest(userId: string) {
    await this.assertUserActive(userId);

    const request = await this.prisma.accountDeletionRequest.findFirst({
      where: { userId, status: DeletionRequestStatus.PENDING },
    });

    if (!request) throw new NotFoundException('No pending deletion request found');

    await this.prisma.accountDeletionRequest.update({
      where: { id: request.id },
      data: { status: DeletionRequestStatus.CANCELLED, cancelledAt: new Date() },
    });

    await this.writeAuditLog(userId, AuditEvent.ACCOUNT_DELETION_CANCELLED);

    return { message: 'Deletion request cancelled.' };
  }

  private async assertUserActive(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true },
    });
    if (!user || !user.isActive) throw new UnauthorizedException();
  }

  private async writeAuditLog(userId: string, event: AuditEvent) {
    try {
      await this.prisma.authAuditLog.create({
        data: { userId, event, success: true },
      });
    } catch {
      // Audit failure must not break the primary flow.
    }
  }
}
