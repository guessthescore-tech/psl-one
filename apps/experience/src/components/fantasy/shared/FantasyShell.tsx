'use client';

import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react';
import { getDataMode } from '@/lib/data';

interface FantasyShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  back?: { href: string; label: string };
}

export function FantasyShell({ children, title, subtitle, back }: FantasyShellProps) {
  const mode = getDataMode();

  return (
    <div className="min-h-[100dvh] bg-exp-void text-white">
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="status"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono"
        >
          DESIGN_REVIEW_DATA — mock data active
        </div>
      )}

      {(back || title) && (
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
          {back && (
            <Link
              href={back.href}
              className="inline-flex items-center gap-1.5 text-sm text-exp-muted hover:text-white transition-colors mb-4 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm"
            >
              <ArrowLeft size={16} aria-hidden />
              {back.label}
            </Link>
          )}
          {title && (
            <h1 className="text-display-sm text-white">{title}</h1>
          )}
          {subtitle && (
            <p className="text-body-md text-exp-muted mt-1">{subtitle}</p>
          )}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-4">
        {children}
      </div>
    </div>
  );
}
