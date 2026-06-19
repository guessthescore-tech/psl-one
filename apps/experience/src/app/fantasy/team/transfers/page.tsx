'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyActionBar } from '@/components/fantasy/shared/FantasyActionBar';
import { FantasyBottomSheet } from '@/components/fantasy/shared/FantasyBottomSheet';
import { FantasyModal } from '@/components/fantasy/shared/FantasyModal';
import { FantasyEmptyState } from '@/components/fantasy/shared/FantasyEmptyState';
import { FantasyPitchView } from '@/components/fantasy/core/FantasyPitchView';
import { BenchPanel } from '@/components/fantasy/core/BenchPanel';
import { TransferPanel } from '@/components/fantasy/core/TransferPanel';
import { TransferConfirmation } from '@/components/fantasy/core/TransferConfirmation';
import { PlayerPool } from '@/components/fantasy/core/PlayerPool';
import { FANTASY_MOCK_TEAM, FANTASY_MOCK_PLAYERS, getDataMode } from '@/lib/data';
import type { ExpFantasyPlayer } from '@/lib/data';

const MOCK_DEADLINE_LOCKED = false;

export default function TransfersPage() {
  const reduce = useReducedMotion();
  const mode = getDataMode();

  // Use mock team for all modes (LIVE_BETA_DATA would fetch from API)
  const [teamPlayers, setTeamPlayers] = useState<ExpFantasyPlayer[]>(FANTASY_MOCK_TEAM.players);
  const [freeTransfers] = useState(FANTASY_MOCK_TEAM.transfersRemaining);
  const [isWildcard] = useState(false);

  const [transferOut, setTransferOut] = useState<ExpFantasyPlayer | null>(null);
  const [transferIn, setTransferIn] = useState<ExpFantasyPlayer | null>(null);
  const [poolOpen, setPoolOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const starters = teamPlayers.filter(p => p.squadRole === 'STARTER');
  const bench = teamPlayers.filter(p => p.squadRole === 'SUBSTITUTE');
  const pickedIds = teamPlayers.map(p => p.id);

  const isHit = !isWildcard && freeTransfers <= 0;

  function handlePlayerClick(player: ExpFantasyPlayer | null) {
    if (!player) return;
    if (MOCK_DEADLINE_LOCKED) return;
    if (transferOut?.id === player.id) {
      // Deselect
      setTransferOut(null);
      setTransferIn(null);
    } else {
      setTransferOut(player);
      setTransferIn(null);
      setPoolOpen(true);
    }
  }

  function handlePoolSelect(player: ExpFantasyPlayer) {
    setTransferIn(player);
    setPoolOpen(false);
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!transferOut || !transferIn) return;

    if (mode === 'DESIGN_REVIEW_DATA') {
      setSubmitting(true);
      await new Promise(r => setTimeout(r, 600));
      // Apply transfer in mock state
      setTeamPlayers(prev =>
        prev.map(p => {
          if (p.id === transferOut.id) {
            return { ...transferIn, squadRole: transferOut.squadRole, benchSlot: transferOut.benchSlot };
          }
          return p;
        })
      );
      setTransferOut(null);
      setTransferIn(null);
      setConfirmOpen(false);
      setSubmitting(false);
      setToast('Transfer confirmed!');
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // LIVE_BETA_DATA
    setSubmitting(true);
    try {
      const { makeTransfers } = await import('@/lib/fantasy-api');
      await makeTransfers({ removePlayerId: transferOut.id, addPlayerId: transferIn.id });
      setConfirmOpen(false);
      setTransferOut(null);
      setTransferIn(null);
      setToast('Transfer confirmed!');
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast('Transfer failed. Please try again.');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  if (MOCK_DEADLINE_LOCKED) {
    return (
      <FantasyShell title="Transfers" back={{ href: '/fantasy/team', label: 'Back to Team' }}>
        <FantasyEmptyState
          icon="🔒"
          title="Transfers Locked"
          message="The deadline has passed. Transfers open again at the start of the next gameweek."
          action={{ label: 'Back to Team', href: '/fantasy/team' }}
        />
      </FantasyShell>
    );
  }

  return (
    <FantasyShell title="Transfers" back={{ href: '/fantasy/team', label: 'Back to Team' }}>
      <div className="pb-32">
        {/* Transfer info bar */}
        <motion.div
          className="px-4 py-3 bg-exp-navy border-b border-exp-border-dk"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isWildcard ? (
            <p className="text-label-md text-exp-green text-center">🔄 Wildcard active — unlimited free transfers</p>
          ) : freeTransfers > 0 ? (
            <p className="text-label-md text-exp-green text-center">
              {freeTransfers} free transfer{freeTransfers > 1 ? 's' : ''} remaining
            </p>
          ) : (
            <p className="text-label-md text-exp-live text-center">⚠️ Transfer hit active: -4 points per transfer</p>
          )}
          <p className="text-label-sm text-exp-muted text-center mt-1">
            Tap a player to transfer them out · Points only, no real money
          </p>
        </motion.div>

        {/* Active transfer panel */}
        {(transferOut || transferIn) && (
          <div className="px-4 pt-4">
            <TransferPanel
              transferOut={transferOut}
              transferIn={transferIn}
              freeTransfers={freeTransfers}
              isWildcard={isWildcard}
            />
          </div>
        )}

        {/* Pitch */}
        <div className="px-3 py-4">
          <FantasyPitchView
            players={starters}
            formation="4-3-3"
            onPlayerClick={handlePlayerClick}
            transferOutId={transferOut?.id ?? null}
          />
        </div>

        {/* Bench */}
        <BenchPanel
          players={bench}
          onPlayerClick={player => handlePlayerClick(player)}
          selectedPlayerId={transferOut?.id}
        />
      </div>

      {/* Action bar */}
      <FantasyActionBar
        primary={{
          label: transferOut && transferIn ? 'Confirm Transfer' : 'Select player to transfer',
          disabled: !transferOut || !transferIn,
          onClick: () => setConfirmOpen(true),
        }}
        secondary={
          transferOut
            ? { label: 'Clear', onClick: () => { setTransferOut(null); setTransferIn(null); } }
            : undefined
        }
        hint={isHit ? 'Transfer hit: -4 points' : undefined}
      />

      {/* Player pool sheet */}
      <FantasyBottomSheet
        open={poolOpen}
        onClose={() => setPoolOpen(false)}
        snapHeight="three-quarters"
        title="Select Replacement"
      >
        <PlayerPool
          players={FANTASY_MOCK_PLAYERS}
          onSelect={handlePoolSelect}
          pickedIds={pickedIds.filter(id => id !== transferOut?.id)}
          filterPosition={transferOut?.position ?? 'ALL'}
        />
      </FantasyBottomSheet>

      {/* Confirmation modal */}
      <FantasyModal
        open={confirmOpen}
        onClose={() => !submitting && setConfirmOpen(false)}
        title="Confirm Transfer"
      >
        {transferOut && transferIn && (
          <TransferConfirmation
            transferOut={transferOut}
            transferIn={transferIn}
            isHit={isHit}
            onConfirm={handleConfirm}
            onCancel={() => setConfirmOpen(false)}
            loading={submitting}
          />
        )}
      </FantasyModal>

      {/* Toast notification */}
      {toast && (
        <motion.div
          className="fixed bottom-24 left-4 right-4 z-50 bg-exp-green text-white text-body-sm font-semibold text-center py-3 rounded-card shadow-card-lg"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3 }}
          role="status"
          aria-live="polite"
        >
          {toast}
        </motion.div>
      )}
    </FantasyShell>
  );
}
