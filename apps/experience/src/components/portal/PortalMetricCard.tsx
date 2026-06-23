'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

interface PortalMetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'flat';
  trendLabel?: string;
  description?: string;
  className?: string;
}

export function PortalMetricCard({
  label,
  value,
  trend,
  trendLabel,
  description,
  className = '',
}: PortalMetricCardProps) {
  const trendColor =
    trend === 'up' ? 'text-green-400' :
    trend === 'down' ? 'text-red-400' :
    'text-slate-400';

  const trendIcon =
    trend === 'up' ? '↑' :
    trend === 'down' ? '↓' :
    '→';

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-4 ${className}`}>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {(trend ?? trendLabel) && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${trendColor}`}>
          <span aria-hidden>{trendIcon}</span>
          <span>{trendLabel ?? trend}</span>
        </p>
      )}
      {description && (
        <p className="text-xs text-slate-500 mt-2">{description}</p>
      )}
    </div>
  );
}
