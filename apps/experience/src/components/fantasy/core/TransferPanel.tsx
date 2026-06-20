'use client';

import type { ExpFantasyPlayer } from '@/lib/data';

interface TransferPanelProps {
  transferOut: ExpFantasyPlayer | null;
  transferIn: ExpFantasyPlayer | null;
  freeTransfers: number;
  isWildcard?: boolean;
}

export function TransferPanel({ transferOut, transferIn, freeTransfers, isWildcard = false }: TransferPanelProps) {
  const costMessage = isWildcard
    ? 'Wildcard active — free transfers'
    : freeTransfers > 0
    ? `${freeTransfers} free transfer${freeTransfers > 1 ? 's' : ''} remaining`
    : 'Transfer hit: -4 pts per transfer';

  const costColor = isWildcard || freeTransfers > 0 ? 'text-exp-green' : 'text-exp-live';

  return (
    <div className="bg-exp-navy border border-exp-border-dk rounded-card px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Transfer OUT */}
        <div className="flex-1 text-center">
          <p className="text-label-sm text-exp-live uppercase tracking-widest mb-1">OUT</p>
          {transferOut ? (
            <div>
              <p className="text-body-sm text-white font-semibold">{transferOut.name}</p>
              <p className="text-label-sm text-exp-muted">{transferOut.club.abbr} · £{transferOut.fantasyPrice}m</p>
            </div>
          ) : (
            <p className="text-body-sm text-exp-muted">Select player</p>
          )}
        </div>

        {/* Arrow */}
        <div className="text-exp-gold text-xl">⇄</div>

        {/* Transfer IN */}
        <div className="flex-1 text-center">
          <p className="text-label-sm text-exp-green uppercase tracking-widest mb-1">IN</p>
          {transferIn ? (
            <div>
              <p className="text-body-sm text-white font-semibold">{transferIn.name}</p>
              <p className="text-label-sm text-exp-muted">{transferIn.club.abbr} · £{transferIn.fantasyPrice}m</p>
            </div>
          ) : (
            <p className="text-body-sm text-exp-muted">Select replacement</p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-exp-border-dk text-center">
        <p className={`text-label-sm ${costColor}`}>{costMessage}</p>
        <p className="text-label-sm text-exp-muted mt-0.5">Points only — no real money</p>
      </div>
    </div>
  );
}
