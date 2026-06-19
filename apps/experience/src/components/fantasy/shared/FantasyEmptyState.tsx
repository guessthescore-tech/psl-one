interface FantasyEmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function FantasyEmptyState({
  title = 'Nothing here yet',
  description,
  action,
}: FantasyEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-exp-navy-2/40 flex items-center justify-center">
        <span className="text-2xl" aria-hidden>📭</span>
      </div>
      <div>
        <p className="text-body-md font-semibold text-white">{title}</p>
        {description && <p className="text-body-sm text-exp-muted mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
