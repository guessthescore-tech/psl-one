import { Injectable } from '@nestjs/common';

export interface StartWalletLinkInput {
  fanUserId: string;
  walletProviderId: string;
  idempotencyKey?: string;
}
export interface StartWalletLinkResult {
  walletLinkId: string;
  providerCustomerRef: string;
  status: string;
  sandboxOnly: boolean;
}
export interface ConfirmWalletLinkInput {
  walletLinkId: string;
  fanUserId: string;
  providerCode?: string;
  idempotencyKey?: string;
}
export interface ConfirmWalletLinkResult {
  walletLinkId: string;
  status: string;
  kycStatus: string;
  sandboxOnly: boolean;
  kycDisclaimer: string;
}
export interface UnlinkWalletInput {
  walletLinkId: string;
  fanUserId: string;
  idempotencyKey?: string;
}
export interface UnlinkWalletResult {
  walletLinkId: string;
  status: string;
  sandboxOnly: boolean;
}
export interface IssueWalletRewardInput {
  walletLinkId: string;
  rewardDefinitionId: string;
  fanUserId: string;
  displayValue: string;
  idempotencyKey?: string;
}
export interface IssueWalletRewardResult {
  transactionId: string;
  status: string;
  providerStatus: string;
  sandboxOnly: boolean;
  disclaimer: string;
}
export interface RedeemVoucherInput {
  walletLinkId: string;
  voucherCode: string;
  fanUserId: string;
  idempotencyKey?: string;
}
export interface RedeemVoucherResult {
  transactionId: string;
  status: string;
  sandboxOnly: boolean;
}
export interface WalletWebhookInput {
  providerSlug: string;
  eventType: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
}
export interface WalletWebhookResult {
  processed: boolean;
  sandboxOnly: boolean;
}

export interface WalletProviderAdapter {
  readonly providerSlug: string;
  startWalletLink(input: StartWalletLinkInput): Promise<StartWalletLinkResult>;
  confirmWalletLink(input: ConfirmWalletLinkInput): Promise<ConfirmWalletLinkResult>;
  unlinkWallet(input: UnlinkWalletInput): Promise<UnlinkWalletResult>;
  issueReward(input: IssueWalletRewardInput): Promise<IssueWalletRewardResult>;
  redeemVoucher(input: RedeemVoucherInput): Promise<RedeemVoucherResult>;
  handleWebhook(input: WalletWebhookInput): Promise<WalletWebhookResult>;
}

@Injectable()
export class SiliconEnterpriseSandboxWalletAdapter implements WalletProviderAdapter {
  readonly providerSlug = 'silicon-enterprise-wallet';

  async startWalletLink(input: StartWalletLinkInput): Promise<StartWalletLinkResult> {
    const providerCustomerRef = `SANDBOX-CUST-${input.fanUserId.slice(0, 8).toUpperCase()}`;
    const walletLinkId = `SANDBOX-WALLET-${Date.now()}`;
    return {
      walletLinkId,
      providerCustomerRef,
      status: 'LINK_PENDING',
      sandboxOnly: true,
    };
  }

  async confirmWalletLink(input: ConfirmWalletLinkInput): Promise<ConfirmWalletLinkResult> {
    return {
      walletLinkId: input.walletLinkId,
      status: 'LINKED',
      kycStatus: 'NOT_STARTED',
      sandboxOnly: true,
      kycDisclaimer: 'Sandbox KYC is not regulated verification. No real identity check performed.',
    };
  }

  async unlinkWallet(input: UnlinkWalletInput): Promise<UnlinkWalletResult> {
    return {
      walletLinkId: input.walletLinkId,
      status: 'UNLINKED',
      sandboxOnly: true,
    };
  }

  async issueReward(input: IssueWalletRewardInput): Promise<IssueWalletRewardResult> {
    return {
      transactionId: `SANDBOX-TXN-${Date.now()}`,
      status: 'PROVIDER_PENDING',
      providerStatus: 'SANDBOX_QUEUED',
      sandboxOnly: true,
      disclaimer: 'Wallet credit is provider-pending. No real value transferred. PSL One does not hold customer funds.',
    };
  }

  async redeemVoucher(input: RedeemVoucherInput): Promise<RedeemVoucherResult> {
    return {
      transactionId: `SANDBOX-REDEEM-${Date.now()}`,
      status: 'SUCCESS',
      sandboxOnly: true,
    };
  }

  async handleWebhook(input: WalletWebhookInput): Promise<WalletWebhookResult> {
    return {
      processed: true,
      sandboxOnly: true,
    };
  }
}
