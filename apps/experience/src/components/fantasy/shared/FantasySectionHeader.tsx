'use client';

import Link from 'next/link';

interface FantasySectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
}

export function FantasySectionHeader({ title, subtitle, viewAllHref }: FantasySectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-display-sm text-white">{title}</h2>
        {subtitle && <p className="text-body-sm text-exp-muted mt-0.5">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-label-md text-exp-gold hover:text-exp-gold/80 transition-colors min-h-[44px] flex items-center focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
        >
          View all →
        </Link>
      )}
    </div>
  );
}
