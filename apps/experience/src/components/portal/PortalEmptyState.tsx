'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

interface PortalEmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function PortalEmptyState({ title, description, action }: PortalEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <span className="text-slate-500 text-xl" aria-hidden>○</span>
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors min-h-[44px]"
          type="button"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
