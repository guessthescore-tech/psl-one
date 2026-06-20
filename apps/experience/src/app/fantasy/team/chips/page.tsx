'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyPageHero } from '@/components/fantasy/shared/FantasyPageHero';
import { FantasyModal } from '@/components/fantasy/shared/FantasyModal';
import { ChipSelector } from '@/components/fantasy/core/ChipSelector';
import { FANTASY_MOCK_CHIPS, getDataMode } from '@/lib/data';
import type { ExpChip } from '@/lib/data';
import type { ChipType } from '@/lib/fantasy-api';

const MOCK_DEADLINE_LOCKED = false;

export default function ChipsPage() {
  const reduce = useReducedMotion();
  const mode = getDataMode();

  const [chips, setChips] = useState<ExpChip[]>(FANTASY_MOCK_CHIPS);
  const [pendingChip, setPendingChip] = useState<ChipType | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const availableCount = chips.filter(c => c.status === 'AVAILABLE').length;
  const activeChip = chips.find(c => c.status === 'ACTIVE');

  function handleActivate(type: ChipType) {
    setPendingChip(type);
    setConfirmModalOpen(true);
  }

  async function handleConfirmActivate() {
    if (!pendingChip) return;
    setSubmitting(true);

    if (mode === 'DESIGN_REVIEW_DATA') {
      await new Promise(r => setTimeout(r, 500));
      setChips(prev => prev.map(c =>
        c.type === pendingChip
          ? { ...c, status: 'ACTIVE' as const }
          : c.status === 'ACTIVE'
          ? { ...c, status: 'AVAILABLE' as const }
          : c
      ));
      setConfirmModalOpen(false);
      setPendingChip(null);
      setSubmitting(false);
      setToast('Chip activated!');
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      const { activateChip } = await import('@/lib/fantasy-api');
      await activateChip(pendingChip, 'current');
      setChips(prev => prev.map(c =>
        c.type === pendingChip ? { ...c, status: 'ACTIVE' as const } : c
      ));
      setToast('Chip activated!');
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast('Failed to activate chip. Try again.');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setConfirmModalOpen(false);
      setPendingChip(null);
      setSubmitting(false);
    }
  }

  async function handleCancel(type: ChipType) {
    if (mode === 'DESIGN_REVIEW_DATA') {
      setChips(prev => prev.map(c =>
        c.type === type ? { ...c, status: 'AVAILABLE' as const } : c
      ));
      setToast('Chip cancelled.');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    try {
      const { cancelChip } = await import('@/lib/fantasy-api');
      await cancelChip(type);
      setChips(prev => prev.map(c =>
        c.type === type ? { ...c, status: 'AVAILABLE' as const } : c
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
  const pendingMeta = pendingChip ? CHIP_CONFIRM[pendingChip] : null;

  return (
    <FantasyShell title="Chips" back={{ href: '/fantasy/team', label: 'Back to Team' }}>
      <div className="pb-8">
        <FantasyPageHero
          title="Game Chips"
          subtitle="Use chips strategically to boost your score"
          stat={{ label: 'Available', value: `${availableCount} chips` }}
        />

        {MOCK_DEADLINE_LOCKED && (
          <div className="mx-4 mt-4 bg-exp-live/10 border border-exp-live/30 rounded-card-xs px-4 py-3">
            <p className="text-body-sm text-exp-live font-semibold">🔒 Deadline passed — chips cannot be activated</p>
          </div>
        )}

        <div className="px-4 py-4">
          <ChipSelector
            chips={chips}
            onActivate={handleActivate}
            onCancel={handleCancel}
            isDeadlineLocked={MOCK_DEADLINE_LOCKED}
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
                disabled={submitting}
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
