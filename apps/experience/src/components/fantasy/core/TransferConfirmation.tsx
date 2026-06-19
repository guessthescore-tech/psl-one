'use client';

import type { ExpFantasyPlayer } from '@/lib/data';

interface TransferConfirmationProps {
  transferOut: ExpFantasyPlayer;
  transferIn: ExpFantasyPlayer;
  isHit: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function TransferConfirmation({
  transferOut,
  transferIn,
  isHit,
  onConfirm,
  onCancel,
  loading,
}: TransferConfirmationProps) {
  return (
    <div className="space-y-4">
      {/* Transfer summary */}
      <div className="bg-exp-ink rounded-card-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-sm text-exp-live uppercase tracking-widest">Removing</p>
            <p className="text-body-md text-white font-semibold">{transferOut.name}</p>
            <p className="text-label-sm text-exp-muted">{transferOut.clubShort} · £{transferOut.price}m · {transferOut.points}pts</p>
          </div>
          <div className="text-exp-live text-2xl">↑</div>
        </div>
        <div className="border-t border-exp-border-dk" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-sm text-exp-green uppercase tracking-widest">Adding</p>
            <p className="text-body-md text-white font-semibold">{transferIn.name}</p>
            <p className="text-label-sm text-exp-muted">{transferIn.clubShort} · £{transferIn.price}m · {transferIn.points}pts</p>
          </div>
          <div className="text-exp-green text-2xl">↓</div>
        </div>
      </div>

      {/* Cost */}
      {isHit && (
        <div className="bg-exp-live/10 border border-exp-live/30 rounded-card-xs px-3 py-2">
          <p className="text-body-sm text-exp-live font-semibold">⚠️ Transfer hit: -4 points</p>
          <p className="text-label-sm text-exp-muted mt-0.5">You have no free transfers remaining. Points only — no financial value.</p>
        </div>
      )}

      <p className="text-label-sm text-exp-muted text-center">Points only — no real money or financial value</p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 min-h-[44px] rounded-pill border border-exp-border-dk text-white text-label-lg focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 min-h-[44px] rounded-pill bg-exp-green text-white text-label-lg focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 disabled:opacity-40"
        >
          {loading ? 'Confirming…' : 'Confirm Transfer'}
        </button>
      </div>
    </div>
  );
}
