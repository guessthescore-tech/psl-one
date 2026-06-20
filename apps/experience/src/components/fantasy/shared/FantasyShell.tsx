'use client';

import Link from 'next/link';
import { CaretLeft } from '@phosphor-icons/react/dist/ssr';
import { DesignReviewBanner } from './DesignReviewBanner';
import { FantasyTabs } from '../nav/FantasyTabs';

interface BackLink {
  href: string;
  label: string;
}

interface FantasyShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  back?: BackLink;
  /** Set true to suppress FantasyTabs (e.g. onboarding wizard, account pages) */
  hideFantasyTabs?: boolean;
}

export function FantasyShell({ children, title, subtitle, back, hideFantasyTabs }: FantasyShellProps) {
  return (
    <div className="min-h-screen bg-exp-void pb-safe">
      <DesignReviewBanner />

      {/* Page header */}
      {(back || title) && (
        <div className="px-4 pt-4 pb-2 bg-exp-void max-w-7xl mx-auto w-full">
          {back && (
            <Link
              href={back.href}
              className="inline-flex items-center gap-1 text-label-lg text-white/50 hover:text-white transition-colors duration-150 mb-3 min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm"
            >
              <CaretLeft size={16} weight="bold" aria-hidden="true" />
              {back.label}
            </Link>
          )}

          {title && (
            <div>
              <h1 className="font-display text-display-md text-white">{title}</h1>
              {subtitle && (
                <p className="text-body-md text-white/50 mt-0.5">{subtitle}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Fantasy section tabs — hidden for wizard flows and account pages */}
      {!hideFantasyTabs && (
        <div className="border-b border-exp-border-dk px-4">
          <FantasyTabs />
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto w-full">{children}</div>
    </div>
  );
}
