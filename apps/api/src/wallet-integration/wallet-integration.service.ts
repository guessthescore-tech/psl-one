import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  WalletLinkStatus,
  WalletKycStatus,
  WalletTransactionType,
  WalletTransactionStatus,
  NotificationType,
  ActivityFeedType,
  ActivityVisibility,
} from '@prisma/client';
import { SiliconEnterpriseSandboxWalletAdapter } from './wallet-provider.adapter';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityFeedService } from '../activity-feed/activity-feed.service';

export interface CreateProviderDto {
  integrationProviderConfigId: string;
  name: string;
  slug: string;
  providerType?: string;
  publicDisplayName?: string;
  baseUrl?: string;
  authType?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
}

export type UpdateProviderDto = Partial<Omit<CreateProviderDto, 'integrationProviderConfigId' | 'slug'>>;

export interface SandboxWebhookDto {
  eventType: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface StartLinkDto {
  providerSlug?: string;
}

export interface ConfirmLinkDto {
  providerSlug: string;
  providerToken?: string;
  idempotencyKey?: string;
}

export interface UnlinkDto {
  providerSlug: string;
  idempotencyKey?: string;
}

const WALLET_SAFETY_NOTE =
  'Wallet services are provided by an external wallet provider. PSL One does not hold customer funds directly.';

@Injectable()
export class WalletIntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sandboxAdapter: SiliconEnterpriseSandboxWalletAdapter,
    private readonly notificationsService: NotificationsService,
    private readonly activityFeedService: ActivityFeedService,
  ) {}

  async adminListProviders() {
    return this.prisma.walletProviderDetail.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminCreateProvider(dto: CreateProviderDto, actorUserId?: string) {
    const config = await this.prisma.integrationProviderConfig.findUnique({
      where: { id: dto.integrationProviderConfigId },
    });
    if (!config) {
      throw new NotFoundException(
        `IntegrationProviderConfig '${dto.integrationProviderConfigId}' not found`,
      );
    }

    const provider = await this.prisma.walletProviderDetail.create({
      data: {
        integrationProviderConfigId: dto.integrationProviderConfigId,
        name: dto.name,
        slug: dto.slug,
        ...(dto.providerType !== undefined ? { providerType: dto.providerType as never } : {}),
        ...(dto.publicDisplayName !== undefined ? { publicDisplayName: dto.publicDisplayName } : {}),
        ...(dto.baseUrl !== undefined ? { baseUrl: dto.baseUrl } : {}),
        ...(dto.authType !== undefined ? { authType: dto.authType as never } : {}),
        ...(dto.contactName !== undefined ? { contactName: dto.contactName } : {}),
        ...(dto.contactEmail !== undefined ? { contactEmail: dto.contactEmail } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      } as never,
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'WALLET_PROVIDER_CREATED',
        entityType: 'WalletProviderDetail',
        entityId: provider.id,
        route: 'POST /admin/wallet/providers',
        metadata: { slug: provider.slug, name: provider.name },
      },
    });

    return provider;
  }

  async adminUpdateProvider(id: string, dto: UpdateProviderDto, actorUserId?: string) {
    const existing = await this.prisma.walletProviderDetail.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`WalletProviderDetail '${id}' not found`);

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data['name'] = dto.name;
    if (dto.providerType !== undefined) data['providerType'] = dto.providerType;
    if (dto.publicDisplayName !== undefined) data['publicDisplayName'] = dto.publicDisplayName;
    if (dto.baseUrl !== undefined) data['baseUrl'] = dto.baseUrl;
    if (dto.authType !== undefined) data['authType'] = dto.authType;
    if (dto.contactName !== undefined) data['contactName'] = dto.contactName;
    if (dto.contactEmail !== undefined) data['contactEmail'] = dto.contactEmail;
    if (dto.notes !== undefined) data['notes'] = dto.notes;

    const updated = await this.prisma.walletProviderDetail.update({
      where: { id },
      data: data as never,
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'WALLET_PROVIDER_UPDATED',
        entityType: 'WalletProviderDetail',
        entityId: id,
        route: `PATCH /admin/wallet/providers/${id}`,
        metadata: { fields: Object.keys(data) },
      },
    });

    return updated;
  }

  async adminListWalletLinks(filters: { fanUserId?: string; status?: string } = {}) {
    const where: Record<string, unknown> = {};
    if (filters.fanUserId) where['fanUserId'] = filters.fanUserId;
    if (filters.status) where['status'] = filters.status;

    const links = await this.prisma.walletLink.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
    });

    return links.map(link => ({
      id: link.id,
      fanUserId: link.fanUserId,
      walletProviderId: link.walletProviderId,
      status: link.status,
      kycStatus: link.kycStatus,
      linkedAt: link.linkedAt,
      lastVerifiedAt: link.lastVerifiedAt,
      unlinkedAt: link.unlinkedAt,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    }));
  }

  async adminListTransactions(
    filters: { fanUserId?: string; transactionType?: string; limit?: number } = {},
  ) {
    const where: Record<string, unknown> = {};
    if (filters.fanUserId) where['fanUserId'] = filters.fanUserId;
    if (filters.transactionType) where['transactionType'] = filters.transactionType;

    const transactions = await this.prisma.walletTransaction.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 100,
    });

    return transactions.map(tx => ({
      id: tx.id,
      walletProviderId: tx.walletProviderId,
      fanUserId: tx.fanUserId,
      walletLinkId: tx.walletLinkId,
      transactionType: tx.transactionType,
      status: tx.status,
      idempotencyKey: tx.idempotencyKey,
      errorCode: tx.errorCode,
      errorMessage: tx.errorMessage,
      createdAt: tx.createdAt,
    }));
  }

  async adminProcessSandboxWebhook(
    providerSlug: string,
    dto: SandboxWebhookDto,
    actorUserId?: string,
  ) {
    const provider = await this.prisma.walletProviderDetail.findUnique({
      where: { slug: providerSlug },
    });
    if (!provider) throw new NotFoundException(`Provider '${providerSlug}' not found`);
    if (provider.status !== 'SANDBOX') {
      throw new BadRequestException(`Provider '${providerSlug}' is not in SANDBOX status`);
    }

    const result = await this.sandboxAdapter.handleWebhook({
      providerSlug,
      eventType: dto.eventType,
      payload: dto.payload,
      ...(dto.idempotencyKey !== undefined ? { idempotencyKey: dto.idempotencyKey } : {}),
    });

    const tx = await this.prisma.walletTransaction.create({
      data: {
        walletProviderId: provider.id,
        transactionType: WalletTransactionType.WEBHOOK_EVENT,
        status: WalletTransactionStatus.SUCCESS,
        ...(dto.idempotencyKey !== undefined ? { idempotencyKey: dto.idempotencyKey } : {}),
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'SANDBOX_WEBHOOK_PROCESSED',
        entityType: 'WalletTransaction',
        entityId: tx.id,
        route: `POST /admin/wallet/webhooks/${providerSlug}/sandbox`,
        metadata: { eventType: dto.eventType, providerSlug },
      },
    });

    return { ...result, sandboxOnly: true };
  }

  async fanGetWalletStatus(fanUserId: string) {
    const link = await this.prisma.walletLink.findFirst({
      where: { fanUserId },
      orderBy: { createdAt: 'desc' },
    });

    if (!link) {
      return {
        status: 'NOT_LINKED',
        kycStatus: 'UNKNOWN',
        safetyNote: WALLET_SAFETY_NOTE,
        sandboxMode: true,
      };
    }

    return {
      id: link.id,
      walletProviderId: link.walletProviderId,
      providerCustomerRef: null,
      providerWalletRef: null,
      status: link.status,
      kycStatus: link.kycStatus,
      linkedAt: link.linkedAt,
      lastVerifiedAt: link.lastVerifiedAt,
      unlinkedAt: link.unlinkedAt,
      createdAt: link.createdAt,
      safetyNote: WALLET_SAFETY_NOTE,
      sandboxMode: true,
    };
  }

  async fanStartWalletLink(fanUserId: string, dto: StartLinkDto) {
    let provider;
    if (dto.providerSlug) {
      provider = await this.prisma.walletProviderDetail.findUnique({
        where: { slug: dto.providerSlug },
      });
      if (!provider) throw new NotFoundException(`Provider '${dto.providerSlug}' not found`);
    } else {
      provider = await this.prisma.walletProviderDetail.findFirst({
        where: { status: 'SANDBOX' },
        orderBy: { createdAt: 'asc' },
      });
      if (!provider) throw new NotFoundException('No SANDBOX wallet provider available');
    }

    const existingLink = await this.prisma.walletLink.findUnique({
      where: { fanUserId_walletProviderId: { fanUserId, walletProviderId: provider.id } },
    });

    let walletLink;
    if (existingLink) {
      walletLink = await this.prisma.walletLink.update({
        where: { id: existingLink.id },
        data: { status: WalletLinkStatus.LINK_PENDING },
      });
    } else {
      walletLink = await this.prisma.walletLink.create({
        data: {
          fanUserId,
          walletProviderId: provider.id,
          status: WalletLinkStatus.LINK_PENDING,
        },
      });
    }

    const adapterResult = await this.sandboxAdapter.startWalletLink({
      fanUserId,
      walletProviderId: provider.id,
    });

    await this.prisma.walletLink.update({
      where: { id: walletLink.id },
      data: { providerCustomerRef: adapterResult.providerCustomerRef },
    });

    await this.prisma.walletTransaction.create({
      data: {
        walletProviderId: provider.id,
        fanUserId,
        walletLinkId: walletLink.id,
        transactionType: WalletTransactionType.LINK_WALLET,
        status: WalletTransactionStatus.PENDING,
      },
    });

    return {
      walletLinkId: walletLink.id,
      status: WalletLinkStatus.LINK_PENDING,
      sandboxOnly: true,
      safetyNote: WALLET_SAFETY_NOTE,
    };
  }

  async fanConfirmWalletLink(fanUserId: string, dto: ConfirmLinkDto) {
    const provider = await this.prisma.walletProviderDetail.findUnique({
      where: { slug: dto.providerSlug },
    });
    if (!provider) throw new NotFoundException(`Provider '${dto.providerSlug}' not found`);

    const walletLink = await this.prisma.walletLink.findUnique({
      where: { fanUserId_walletProviderId: { fanUserId, walletProviderId: provider.id } },
    });
    if (!walletLink) throw new NotFoundException('No wallet link found for this provider. Call /link/start first.');

    const adapterResult = await this.sandboxAdapter.confirmWalletLink({
      walletLinkId: walletLink.id,
      fanUserId,
      ...(dto.providerToken !== undefined ? { providerCode: dto.providerToken } : {}),
      ...(dto.idempotencyKey !== undefined ? { idempotencyKey: dto.idempotencyKey } : {}),
    });

    const now = new Date();
    await this.prisma.walletLink.update({
      where: { id: walletLink.id },
      data: {
        status: WalletLinkStatus.LINKED,
        kycStatus: WalletKycStatus.NOT_STARTED,
        linkedAt: now,
      },
    });

    await this.prisma.walletTransaction.create({
      data: {
        walletProviderId: walletLink.walletProviderId,
        fanUserId,
        walletLinkId: walletLink.id,
        transactionType: WalletTransactionType.LINK_WALLET,
        status: WalletTransactionStatus.SUCCESS,
        ...(dto.idempotencyKey !== undefined ? { idempotencyKey: dto.idempotencyKey } : {}),
      },
    });

    void this.notificationsService.createInAppNotification({
      userId: fanUserId,
      type: NotificationType.WALLET_LINKED,
      title: 'Wallet linked',
      body: 'Your wallet has been linked successfully. Sandbox mode — no real funds held.',
      sourceType: 'WalletLink',
      sourceId: walletLink.id,
    }).catch(() => null);

    void this.activityFeedService.createUserActivity(fanUserId, {
      type: ActivityFeedType.WALLET_LINKED,
      title: 'Wallet linked',
      body: 'Wallet linked in sandbox mode.',
      visibility: ActivityVisibility.PRIVATE,
      sourceType: 'WalletLink',
      sourceId: walletLink.id,
    }).catch(() => null);

    return {
      status: 'LINKED',
      kycStatus: adapterResult.kycStatus,
      sandboxOnly: true,
      kycDisclaimer: adapterResult.kycDisclaimer,
    };
  }

  async fanUnlinkWallet(fanUserId: string, dto: UnlinkDto) {
    const provider = await this.prisma.walletProviderDetail.findUnique({
      where: { slug: dto.providerSlug },
    });
    if (!provider) throw new NotFoundException(`Provider '${dto.providerSlug}' not found`);

    const walletLink = await this.prisma.walletLink.findUnique({
      where: { fanUserId_walletProviderId: { fanUserId, walletProviderId: provider.id } },
    });
    if (!walletLink) throw new NotFoundException('No wallet link found for this provider.');
    if (walletLink.status !== WalletLinkStatus.LINKED) {
      throw new BadRequestException(`Cannot unlink: wallet is in status '${walletLink.status}'`);
    }

    await this.sandboxAdapter.unlinkWallet({
      walletLinkId: walletLink.id,
      fanUserId,
      ...(dto.idempotencyKey !== undefined ? { idempotencyKey: dto.idempotencyKey } : {}),
    });

    const now = new Date();
    await this.prisma.walletLink.update({
      where: { id: walletLink.id },
      data: { status: WalletLinkStatus.UNLINKED, unlinkedAt: now },
    });

    await this.prisma.walletTransaction.create({
      data: {
        walletProviderId: walletLink.walletProviderId,
        fanUserId,
        walletLinkId: walletLink.id,
        transactionType: WalletTransactionType.UNLINK_WALLET,
        status: WalletTransactionStatus.SUCCESS,
        ...(dto.idempotencyKey !== undefined ? { idempotencyKey: dto.idempotencyKey } : {}),
      },
    });

    return {
      status: 'UNLINKED',
      sandboxOnly: true,
    };
  }
}
