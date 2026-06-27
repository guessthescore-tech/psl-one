'use client';

import { useEffect, useState } from 'react';
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
import { getDataMode, isLiveDataMode } from '@/lib/data';
import type { ExpFantasyPlayer } from '@/lib/data';
import { getDeadline, getPlayerPool, getTeam, getTransferStatus, makeTransfers } from '@/lib/fantasy-api';
import { toExpFantasyPlayer, toExpFantasySquad } from '@/lib/fantasy-player-mapper';

export default function TransfersPage() {
  const reduce = useReducedMotion();
  const mode = getDataMode();

  const [teamPlayers, setTeamPlayers] = useState<ExpFantasyPlayer[]>([]);
  const [freeTransfers, setFreeTransfers] = useState(0);
  const [isWildcard] = useState(false);
  const [playerPool, setPlayerPool] = useState<ExpFantasyPlayer[]>([]);
  const [poolLoading, setPoolLoading] = useState(true);
  const [poolError, setPoolError] = useState<string | null>(null);
  const [deadlineLocked, setDeadlineLocked] = useState(false);

  const [transferOut, setTransferOut] = useState<ExpFantasyPlayer | null>(null);
  const [transferIn, setTransferIn] = useState<ExpFantasyPlayer | null>(null);
  const [poolOpen, setPoolOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const starters = teamPlayers.filter((p) => p.squadRole === 'STARTER');
  const bench = teamPlayers.filter((p) => p.squadRole === 'SUBSTITUTE');
  const pickedIds = teamPlayers.map((p) => p.id);

  const isHit = !isWildcard && freeTransfers <= 0;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!isLiveDataMode(mode)) {
          const { FANTASY_MOCK_TEAM, FANTASY_MOCK_PLAYERS } = await import('@/lib/data');
          if (cancelled) return;
          setTeamPlayers(FANTASY_MOCK_TEAM.players);
          setFreeTransfers(FANTASY_MOCK_TEAM.transfersRemaining);
          setPlayerPool(FANTASY_MOCK_PLAYERS);
          setPoolLoading(false);
          return;
        }

        const [team, transferStatus, deadline, pool] = await Promise.all([
          getTeam(),
          getTransferStatus(),
          getDeadline().catch(() => null),
          getPlayerPool().catch(() => []),
        ]);

        if (cancelled) return;
        const squad = toExpFantasySquad(team);
        setTeamPlayers(squad.players);
        setFreeTransfers(transferStatus.freeTransfersAvailable);
        setDeadlineLocked(Boolean(transferStatus.isDeadlineLocked || deadline?.isLocked));
        setPlayerPool(pool.map((p) => toExpFantasyPlayer(p)));
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Could not load the live transfer screen.';
        setPoolError(message);
      } finally {
        if (!cancelled) setPoolLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  function handlePlayerClick(player: ExpFantasyPlayer | null) {
    if (!player || deadlineLocked) return;
    if (transferOut?.id === player.id) {
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

    setSubmitting(true);
    try {
      if (!isLiveDataMode(mode)) {
        setTeamPlayers((prev) =>
          prev.map((p) => (p.id === transferOut.id ? { ...transferIn, squadRole: transferOut.squadRole, benchSlot: transferOut.benchSlot } : p)),
        );
      } else {
        const updated = await makeTransfers({ removePlayerId: transferOut.id, addPlayerId: transferIn.id });
        setTeamPlayers(toExpFantasySquad(updated).players);
      }

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

  if (poolLoading) {
    return (
      <FantasyShell title="Transfers" back={{ href: '/fantasy/team', label: 'Back to Team' }}>
        <div className="px-4 py-6 text-exp-muted">Loading live transfer data...</div>
      </FantasyShell>
    );
  }

  if (poolError) {
    return (
      <FantasyShell title="Transfers" back={{ href: '/fantasy/team', label: 'Back to Team' }}>
        <FantasyEmptyState
          icon="⚠️"
          title="Could not load transfers"
          message={poolError}
          action={{ label: 'Back to Team', href: '/fantasy/team' }}
        />
      </FantasyShell>
    );
  }

  return (
    <FantasyShell title="Transfers" back={{ href: '/fantasy/team', label: 'Back to Team' }}>
      <div className="pb-32">
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

        <div className="px-3 py-4">
          <FantasyPitchView
            players={starters}
            formation="4-3-3"
            onPlayerClick={handlePlayerClick}
            transferOutId={transferOut?.id ?? null}
          />
        </div>

        <BenchPanel
          players={bench}
          onPlayerClick={(player) => handlePlayerClick(player)}
          selectedPlayerId={transferOut?.id}
        />
      </div>

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

      <FantasyBottomSheet
        open={poolOpen}
        onClose={() => setPoolOpen(false)}
        snapHeight="three-quarters"
        title="Select Replacement"
      >
        <PlayerPool
          players={playerPool}
          onSelect={handlePoolSelect}
          pickedIds={pickedIds.filter((id) => id !== transferOut?.id)}
          filterPosition={transferOut?.position ?? 'ALL'}
        />
      </FantasyBottomSheet>

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

      {toast && (
        <motion.div
          className="fixed bottom-24 left-4 right-4 z-50 bg-exp-green text-white text-body-sm font-semibold text-center py-3 rounded-card shadow-card-lg"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
        >
          {toast}
        </motion.div>
      )}
    </FantasyShell>
  );
}
