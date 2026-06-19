'use client';

interface BudgetIndicatorProps {
  remaining: number;
  total?: number;
}

export function BudgetIndicator({ remaining, total = 100 }: BudgetIndicatorProps) {
  const spent = total - remaining;
  const pct = Math.min(100, Math.max(0, (spent / total) * 100));
  const isLow = remaining < 5;
  const isCritical = remaining < 1;

  return (
    <div className="bg-exp-navy rounded-card-xs p-3 border border-exp-border-dk">
      <div className="flex items-center justify-between mb-2">
        <span className="text-label-sm text-exp-muted uppercase tracking-widest">Budget</span>
        <span className={`text-stat-md font-mono ${
          isCritical ? 'text-exp-live' :
          isLow      ? 'text-amber-400' :
          'text-exp-gold'
        }`}>
          £{remaining.toFixed(1)}m
        </span>
      </div>
      <div className="h-1.5 bg-exp-void rounded-pill overflow-hidden">
        <div
          className={`h-full rounded-pill transition-all duration-300 ${
            isCritical ? 'bg-exp-live' :
            isLow      ? 'bg-amber-400' :
            'bg-exp-green'
          }`}
          style={{ width: `${100 - pct}%` }}
        />
      </div>
      <p className="text-label-sm text-exp-muted mt-1">£{spent.toFixed(1)}m spent of £{total}m</p>
    </div>
  );
}
