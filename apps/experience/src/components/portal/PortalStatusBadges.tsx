'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * WALLET_SANDBOX_ONLY - no production wallet
 * FANTASY_POINTS_ONLY - no real-money fantasy
 * GTS_POINTS_ONLY - no real-money guess the score
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 */

type BadgeVariant = 'inactive' | 'active' | 'sandbox' | 'warning' | 'info' | 'points';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  inactive: 'bg-red-500/15 text-red-400 border border-red-500/30',
  active:   'bg-green-500/15 text-green-400 border border-green-500/30',
  sandbox:  'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  warning:  'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  info:     'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  points:   'bg-purple-500/15 text-purple-400 border border-purple-500/30',
};

export function StatusBadge({ label, variant = 'info' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${VARIANT_CLASSES[variant]}`}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-80" aria-hidden />
      {label}
    </span>
  );
}

/**
 * Standard platform status badges shown on every portal page.
 * Confirms operational constraints to all portal users.
 */
export function PortalStatusBadges() {
  return (
    <div className="flex flex-wrap gap-2 items-center" role="status" aria-label="Platform status indicators">
      <StatusBadge label="PSL INACTIVE" variant="inactive" />
      <StatusBadge label="WC 2026 ACTIVE" variant="active" />
      <StatusBadge label="WALLET SANDBOX" variant="sandbox" />
      <StatusBadge label="GTS POINTS ONLY" variant="points" />
      <StatusBadge label="FANTASY POINTS ONLY" variant="points" />
      <StatusBadge label="SPONSOR REWARDS NON-FINANCIAL" variant="info" />
    </div>
  );
}
