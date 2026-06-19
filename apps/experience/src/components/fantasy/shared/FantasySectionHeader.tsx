interface FantasySectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function FantasySectionHeader({ title, subtitle, action }: FantasySectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 className="text-display-sm text-white">{title}</h2>
        {subtitle && <p className="text-body-sm text-exp-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
