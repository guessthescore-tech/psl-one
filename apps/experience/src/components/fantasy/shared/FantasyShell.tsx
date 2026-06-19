'use client';

import Link from 'next/link';
import { getDataMode } from '@/lib/data';

interface FantasyShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  back?: {
    href: string;
    label: string;
  };
}

export function FantasyShell({ children, title, subtitle, back }: FantasyShellProps) {
  const mode = getDataMode();

  return (
    <div className="min-h-[100dvh] bg-exp-void text-white">
      {/* Design review banner */}
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          aria-label="Design review mode"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA — WC 2026 mock data active
        </div>
      )}

      {/* Page header */}
      {(title || back) && (
        <header className="bg-exp-navy border-b border-exp-border-dk px-4 py-3 flex items-center gap-3">
          {back && (
            <Link
              href={back.href}
              aria-label={back.label}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-exp-muted hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 -ml-2"
            >
              ←
            </Link>
          )}
          <div>
            {title && <h1 className="text-display-sm text-white leading-tight">{title}</h1>}
            {subtitle && <p className="text-body-sm text-exp-muted">{subtitle}</p>}
          </div>
        </header>
      )}

      {children}
    </div>
  );
}
