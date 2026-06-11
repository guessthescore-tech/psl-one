import { z } from 'zod';

export const WALLET_TRANSACTION_CREDITED_TOPIC = 'wallet.transaction.credited';
export const WALLET_TRANSACTION_DEBITED_TOPIC = 'wallet.transaction.debited';

export enum WalletTransactionType {
  POINTS_CREDIT = 'POINTS_CREDIT',
  POINTS_DEBIT = 'POINTS_DEBIT',
  REWARD_REDEMPTION = 'REWARD_REDEMPTION',
}

export const WalletTransactionPayloadSchema = z.object({
  transactionId: z.string().uuid(),
  walletId: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().int().positive(),
  type: z.nativeEnum(WalletTransactionType),
  referenceId: z.string().uuid().optional(),
  newBalance: z.number().int().min(0),
});

export type WalletTransactionPayload = z.infer<typeof WalletTransactionPayloadSchema>;
