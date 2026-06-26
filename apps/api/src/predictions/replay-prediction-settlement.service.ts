/**
 * ReplayPredictionSettlementService
 *
 * Predictions-domain settlement for World Cup beta historical replay.
 * Owns all GTS prediction/ledger writes during replay confirmed mode.
 *
 * Plain class (no NestJS): takes PrismaClient directly so it can be used
 * from the CLI script without a NestJS bootstrap.
 *
 * Transaction strategy:
 *   Happy path (PENDING/LOCKED): $transaction wraps scorePrediction.update +
 *   predictionPointsLedger.create atomically — both succeed or both roll back.
 *   A re-check inside the transaction prevents duplicate ledger entries under
 *   concurrent reruns. A DB-level partial unique index on prediction_id
 *   (WHERE prediction_id IS NOT NULL) provides the final safety net; if it
 *   fires, the P2002 error is caught and treated as 'skipped'.
 *
 *   Repair path (already WON/LOST but ledger missing): creates only the ledger
 *   entry. This recovers the failure mode where status was updated but ledger
 *   creation failed on a prior run. P2002 on the repair create is also caught
 *   (concurrent repair completed first) and treated gracefully.
 *
 *   Skip path (WON/LOST + ledger exists): no new prediction/ledger writes.
 *   FanValueLedger IS upserted on every terminal path — including the skip
 *   path — to repair the failure mode where a prior run committed the prediction
 *   ledger but then failed on the fan-value write.
 *
 *   FanValueLedger: written outside the transaction because it has a DB-level
 *   @@unique(idempotencyKey) constraint — idempotent by design.
 *
 * No betting, no gambling, no real-money mechanics. Points only.
 */

import {
  PrismaClient,
  PredictionStatus,
  FanValueSourceType,
  FanValueType,
  FanValueStatus,
} from '@prisma/client';
import { calculatePoints } from './scoring';

const SYNTHETIC_GTS_EMAIL = (i: number) => `replay-wc-gts-${i}@wc-beta.internal`;
// Non-valid bcrypt hash — these accounts are never used for real auth
const SYNTHETIC_PASSWORD_HASH = '$2b$10$replay.wc.synthetic.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

export interface ReplayGtsCaseInput {
  label: string;
  predictedHome: number;
  predictedAway: number;
}

export interface ReplayGtsSettlementEntry {
  label: string;
  userId: string;
  predictionId: string | null;
  points: number;
  action: 'settled' | 'repaired' | 'skipped' | 'dry-run';
}

export interface ReplayGtsSettlementSummary {
  settled: number;
  repaired: number;
  skipped: number;
  entries: ReplayGtsSettlementEntry[];
}

export class ReplayPredictionSettlementService {
  constructor(private readonly prisma: PrismaClient) {}

  /** Upsert one synthetic GTS user per on-time case (1-based index). Idempotent. */
  async upsertSyntheticUsers(count: number): Promise<Array<{ id: string; index: number }>> {
    const users: Array<{ id: string; index: number }> = [];
    for (let i = 1; i <= count; i++) {
      const user = await this.prisma.user.upsert({
        where: { email: SYNTHETIC_GTS_EMAIL(i) },
        create: {
          email: SYNTHETIC_GTS_EMAIL(i),
          passwordHash: SYNTHETIC_PASSWORD_HASH,
          dateOfBirth: new Date('2000-01-01'),
        },
        update: {},
        select: { id: true },
      });
      users.push({ id: user.id, index: i });
    }
    return users;
  }

  /**
   * Settle one on-time GTS case per synthetic user.
   *
   * All three terminal-state paths (settle, repair, skip) ensure FanValueLedger
   * exists via an idempotent upsert before returning. This prevents the
   * "permanent skip" failure mode where the prediction ledger was written but
   * the fan-value upsert failed on a prior run.
   *
   * @param fixtureId   The completed fixture being replayed
   * @param userCases   Parallel array of {userId, label, predictedHome, predictedAway}
   * @param fixture     Actual fixture scores + seasonId
   * @param options     dryRun: true → compute only, zero writes
   */
  async settle(
    fixtureId: string,
    userCases: Array<{
      userId: string;
      label: string;
      predictedHome: number;
      predictedAway: number;
    }>,
    fixture: { homeScore: number; awayScore: number; seasonId: string },
    options: { dryRun: boolean },
  ): Promise<ReplayGtsSettlementSummary> {
    const entries: ReplayGtsSettlementEntry[] = [];
    let settled = 0;
    let repaired = 0;
    let skipped = 0;
    const settledAt = new Date();

    for (const uc of userCases) {
      const points = calculatePoints(
        fixture.homeScore,
        fixture.awayScore,
        uc.predictedHome,
        uc.predictedAway,
      );

      if (options.dryRun) {
        entries.push({ label: uc.label, userId: uc.userId, predictionId: null, points, action: 'dry-run' });
        continue;
      }

      // Upsert prediction — update:{} preserves already-settled status (idempotency)
      const prediction = await this.prisma.scorePrediction.upsert({
        where: { userId_fixtureId: { userId: uc.userId, fixtureId } },
        create: {
          userId: uc.userId,
          fixtureId,
          predictedHomeScore: uc.predictedHome,
          predictedAwayScore: uc.predictedAway,
          status: PredictionStatus.LOCKED,
        },
        update: {},
        select: { id: true, status: true, pointsAwarded: true },
      });

      const alreadyTerminal =
        prediction.status === PredictionStatus.WON ||
        prediction.status === PredictionStatus.LOST;

      // Check whether a ledger entry for this prediction already exists
      const existingLedger = await this.prisma.predictionPointsLedger.findFirst({
        where: { predictionId: prediction.id },
        select: { id: true },
      });

      // ── Skip path: fully settled on a prior run ──────────────────────────────
      if (alreadyTerminal && existingLedger) {
        // Ensure FanValueLedger exists even when prediction ledger is already written.
        // This repairs the failure mode where a prior run committed the prediction
        // ledger but then failed on the fan-value upsert.
        await this.postFanValueLedger(prediction.id, uc.userId, points, fixtureId, fixture.seasonId);
        skipped++;
        entries.push({
          label: uc.label, userId: uc.userId, predictionId: prediction.id,
          points, action: 'skipped',
        });
        continue;
      }

      const targetStatus = points > 0 ? PredictionStatus.WON : PredictionStatus.LOST;

      // ── Repair path: status was updated but ledger write failed on a prior run ─
      if (alreadyTerminal && !existingLedger) {
        try {
          await this.prisma.predictionPointsLedger.create({
            data: {
              userId: uc.userId,
              fixtureId,
              predictionId: prediction.id,
              points: prediction.pointsAwarded ?? points,
              reason: `[WC-REPLAY-REPAIR] Prediction ledger repair: ${points} pts`,
            },
          });
        } catch (err) {
          if (!this.isPrismaUniqueError(err)) throw err;
          // Another concurrent repair already created it — fall through to fan-value
        }
        await this.postFanValueLedger(prediction.id, uc.userId, points, fixtureId, fixture.seasonId);
        repaired++;
        entries.push({
          label: uc.label, userId: uc.userId, predictionId: prediction.id,
          points, action: 'repaired',
        });
        continue;
      }

      // ── Happy path: PENDING/LOCKED → settle atomically ───────────────────────
      // DB-level partial unique index on prediction_id (WHERE NOT NULL) is the
      // final safety net. The inner re-check handles the common concurrent case
      // before touching the unique constraint.
      let txAction: 'settled' | 'skipped' = 'settled';

      try {
        await this.prisma.$transaction(async (tx) => {
          // Re-check inside the transaction to guard against concurrent reruns
          const doubleCheck = await tx.predictionPointsLedger.findFirst({
            where: { predictionId: prediction.id },
            select: { id: true },
          });
          if (doubleCheck) {
            txAction = 'skipped'; // concurrent run already wrote it
            return;
          }

          await tx.scorePrediction.update({
            where: { id: prediction.id },
            data: { pointsAwarded: points, status: targetStatus, settledAt },
          });

          await tx.predictionPointsLedger.create({
            data: {
              userId: uc.userId,
              fixtureId,
              predictionId: prediction.id,
              points,
              reason: `[WC-REPLAY] Prediction settlement: ${points} pts`,
            },
          });
        });
      } catch (err) {
        if (this.isPrismaUniqueError(err)) {
          // DB unique constraint fired — another concurrent run committed first
          txAction = 'skipped';
        } else {
          throw err;
        }
      }

      // Always ensure FanValueLedger exists regardless of txAction (idempotent upsert).
      // This covers: new settlement AND concurrent-skipped (where fan-value may be
      // the one thing missing from the concurrent run).
      await this.postFanValueLedger(prediction.id, uc.userId, points, fixtureId, fixture.seasonId);

      if (txAction === 'settled') {
        settled++;
        entries.push({
          label: uc.label, userId: uc.userId, predictionId: prediction.id,
          points, action: 'settled',
        });
      } else {
        skipped++;
        entries.push({
          label: uc.label, userId: uc.userId, predictionId: prediction.id,
          points, action: 'skipped',
        });
      }
    }

    return { settled, repaired, skipped, entries };
  }

  private async postFanValueLedger(
    predictionId: string,
    userId: string,
    points: number,
    fixtureId: string,
    seasonId: string,
  ) {
    const idempotencyKey = `PREDICTION_SETTLEMENT:${predictionId}`;
    await this.prisma.fanValueLedger.upsert({
      where: { idempotencyKey },
      create: {
        userId,
        sourceType: FanValueSourceType.PREDICTION_SETTLEMENT,
        sourceId: predictionId,
        idempotencyKey,
        predictionId,
        fixtureId,
        seasonId,
        points,
        valueType: FanValueType.PREDICTION_POINTS,
        status: FanValueStatus.POSTED,
        description: `[WC-REPLAY] Prediction settlement: ${points} pts`,
      },
      update: {},
    });
  }

  private isPrismaUniqueError(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    );
  }
}
