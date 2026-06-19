'use client';

import { ManagerRow } from './ManagerRow';
import type { ExpLeagueManager } from '@/lib/data';

interface LeagueStandingsTableProps {
  managers: ExpLeagueManager[];
  currentUserId?: string;
  leagueId: string;
}

export function LeagueStandingsTable({ managers, currentUserId, leagueId }: LeagueStandingsTableProps) {
  return (
    <div
      role="table"
      aria-label="League standings"
      className="w-full"
    >
      {/* Header */}
      <div
        role="row"
        className="flex items-center gap-3 px-4 py-2 bg-exp-ink border-b border-exp-border-dk"
      >
        <div role="columnheader" className="w-6 text-center text-label-sm text-exp-muted flex-shrink-0">#</div>
        <div role="columnheader" className="w-8 text-center text-label-sm text-exp-muted flex-shrink-0">±</div>
        <div role="columnheader" className="flex-1 text-label-sm text-exp-muted">Manager</div>
        <div role="columnheader" className="text-right text-label-sm text-exp-muted flex-shrink-0">GW</div>
        <div role="columnheader" className="w-16 text-right text-label-sm text-exp-muted flex-shrink-0">Total</div>
      </div>

      {/* Rows */}
      <div role="rowgroup">
        {managers.map((manager, index) => (
          <ManagerRow
            key={manager.rank}
            manager={manager}
            isCurrentUser={manager.isMe}
            leagueId={leagueId}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
