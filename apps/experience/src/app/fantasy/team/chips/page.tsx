'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyPageHero } from '@/components/fantasy/shared/FantasyPageHero';
import { FantasyModal } from '@/components/fantasy/shared/FantasyModal';
import { ChipSelector } from '@/components/fantasy/core/ChipSelector';
import { FANTASY_MOCK_CHIPS, getDataMode } from '@/lib/data';
import type { ExpChip } from '@/lib/data';
import type { ChipType } from '@/lib/fantasy-api';
import { getChips, getTransferStatus } from '@/lib/fantasy-api';

export default function ChipsPage() {
  const reduce = useReducedMotion();
  const mode = getDataMode();

  const [chips, setChips] = useState<ExpChip[]>(mode === 'DESIGN_REVIEW_DATA' ? FANTASY_MOCK_CHIPS : []);
  const [currentGameweekId, setCurrentGameweekId] = useState<string | null>(null);
  const [isDeadlineLocked, setIsDeadlineLocked] = useState(false);
  const [pendingChipId, setPendingChipId] = useState<string | null>(null);
  const [pendingChipType, setPendingChipType] = useState<ChipType | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'DESIGN_REVIEW_DATA') return;

    let cancelled = false;

    // Load chips and current transfer status (for gameweekId + deadline state) in parallel
    void Promise.all([
      getChips(),
      getTransferStatus().catch(() => null),
    ]).then(([data, transferStatus]) => {
      if (cancelled) return;

      setChips(
        data.map((chip) => ({
          id: chip.id,
          type: chip.type,
          status: chip.status === 'USED' ? 'USED' : chip.status === 'ACTIVE' ? 'ACTIVE' : 'AVAILABLE',
          usedInGameweek: chip.gameweekId ? null : null,
        })),
      );

      if (transferStatus) {
        setCurrentGameweekId(transferStatus.gameweekId);
        setIsDeadlineLocked(transferStatus.isDeadlineLocked);
      }
    }).catch(() => {
      if (!cancelled) setChips([]);
    });

    return () => {
      cancelled = true;
    };
  }, [mode]);

  const availableCount = chips.filter(c => c.status === 'AVAILABLE').length;
  const activeChip = chips.find(c => c.status === 'ACTIVE');

  function handleActivate(type: ChipType) {
    // Find the specific chip record so we can pass its real ID to the API
    const chip = chips.find(c => c.type === type && c.status === 'AVAILABLE');
    if (!chip) return;
    setPendingChipId(chip.id);
    setPendingChipType(type);
    setConfirmModalOpen(true);
  }

  async function handleConfirmActivate() {
    if (!pendingChipId || !pendingChipType) return;
    setSubmitting(true);

    if (mode === 'DESIGN_REVIEW_DATA') {
      await new Promise(r => setTimeout(r, 500));
      setChips(prev => prev.map(c =>
        c.id === pendingChipId
          ? { ...c, status: 'ACTIVE' as const }
          : c.status === 'ACTIVE'
          ? { ...c, status: 'AVAILABLE' as const }
          : c
      ));
      setConfirmModalOpen(false);
      setPendingChipId(null);
      setPendingChipType(null);
      setSubmitting(false);
      setToast('Chip activated!');
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (!currentGameweekId) {
      setToast('No active gameweek — cannot activate chip right now.');
      setTimeout(() => setToast(null), 4000);
      setConfirmModalOpen(false);
      setSubmitting(false);
      return;
    }

    try {
      const { activateChip } = await import('@/lib/fantasy-api');
      await activateChip(pendingChipId, currentGameweekId);
      setChips(prev => prev.map(c =>
        c.id === pendingChipId ? { ...c, status: 'ACTIVE' as const } : c
      ));
      setToast('Chip activated!');
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast('Failed to activate chip. Try again.');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setConfirmModalOpen(false);
      setPendingChipId(null);
      setPendingChipType(null);
      setSubmitting(false);
    }
  }

  async function handleCancel(type: ChipType) {
    const chip = chips.find(c => c.type === type && c.status === 'ACTIVE');
    if (!chip) return;

    if (mode === 'DESIGN_REVIEW_DATA') {
      setChips(prev => prev.map(c =>
        c.id === chip.id ? { ...c, status: 'AVAILABLE' as const } : c
      ));
      setToast('Chip cancelled.');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    try {
      const { cancelChip } = await import('@/lib/fantasy-api');
      await cancelChip(chip.id);
      setChips(prev => prev.map(c =>
        c.id === chip.id ? { ...c, status: 'AVAILABLE' as const } : c
      ));
      setToast('Chip cancelled.');
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast('Failed to cancel chip.');
      setTimeout(() => setToast(null), 3000);
    }
  }

  const CHIP_CONFIRM: Record<ChipType, { name: string; warning: string }> = {
    WILDCARD:       { name: 'Wildcard',        warning: 'This will allow unlimited free transfers this gameweek.' },
    BENCH_BOOST:    { name: 'Bench Boost',     warning: 'Bench players will score points this gameweek.' },
    TRIPLE_CAPTAIN: { name: 'Triple Captain',  warning: 'Your captain earns triple points this gameweek.' },
    FREE_HIT:       { name: 'Free Hit',        warning: 'Your squad reverts to its current state after this gameweek.' },
  };
  const pendingMeta = pendingChipType ? CHIP_CONFIRM[pendingChipType] : null;

  return (
    <FantasyShell title="Chips" back={{ href: '/fantasy/team', label: 'Back to Team' }}>
      <div className="pb-8">
        <FantasyPageHero
          title="Game Chips"
          subtitle="Use chips strategically to boost your score"
          stat={{ label: 'Available', value: `${availableCount} chips` }}
        />

        {isDeadlineLocked && (
          <div className="mx-4 mt-4 bg-exp-live/10 border border-exp-live/30 rounded-card-xs px-4 py-3">
            <p className="text-body-sm text-exp-live font-semibold">🔒 Deadline passed — chips cannot be activated</p>
          </div>
        )}

        {activeChip && !isDeadlineLocked && (
          <div className="mx-4 mt-4 bg-exp-green/10 border border-exp-green/30 rounded-card-xs px-4 py-3">
            <p className="text-body-sm text-exp-green font-semibold">
              {CHIP_CONFIRM[activeChip.type]?.name} is active this gameweek
            </p>
          </div>
        )}

        <div className="px-4 py-4">
          <ChipSelector
            chips={chips}
            onActivate={handleActivate}
            onCancel={handleCancel}
            isDeadlineLocked={isDeadlineLocked}
          />
        </div>

        <p className="px-4 pb-4 text-label-sm text-exp-muted text-center">
          Points only — no real money or financial value. Each chip can only be used once per season.
        </p>
      </div>

      {/* Confirm modal */}
      <FantasyModal
        open={confirmModalOpen}
        onClose={() => !submitting && setConfirmModalOpen(false)}
        title={`Activate ${pendingMeta?.name ?? ''}`}
      >
        {pendingMeta && (
          <div className="space-y-4">
            <p className="text-body-md text-white">{pendingMeta.warning}</p>
            <p className="text-body-sm text-exp-muted">
              This chip will be used for the current gameweek. Once activated, it cannot be changed until the gameweek ends.
            </p>
            {!currentGameweekId && (
              <p className="text-body-sm text-exp-live">No active gameweek found — activation may fail.</p>
            )}
            <p className="text-label-sm text-exp-muted">Points only — no real money or financial value.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                disabled={submitting}
                className="flex-1 min-h-[44px] rounded-pill border border-exp-border-dk text-white text-label-lg focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmActivate}
                disabled={submitting || !currentGameweekId}
                className="flex-1 min-h-[44px] rounded-pill bg-exp-green text-white text-label-lg focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 disabled:opacity-40"
              >
                {submitting ? 'Activating…' : 'Activate'}
              </button>
            </div>
          </div>
        )}
      </FantasyModal>

      {/* Toast */}
      {toast && (
        <motion.div
          className="fixed bottom-8 left-4 right-4 z-50 bg-exp-navy border border-exp-green/40 text-white text-body-sm font-semibold text-center py-3 rounded-card shadow-card-lg"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
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
