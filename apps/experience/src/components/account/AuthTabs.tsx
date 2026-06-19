'use client';

import Link from 'next/link';
import { clsx } from 'clsx';

interface AuthTabsProps {
  active: 'sign-in' | 'register';
}

/**
 * "Sign In" | "Register" tabs for the top of the auth card.
 * Clicking the inactive tab navigates to that route.
 */
export function AuthTabs({ active }: AuthTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Authentication options"
      className="flex gap-1 bg-exp-void/60 rounded-card-sm p-1 mb-6"
    >
      <Link
        href="/sign-in"
        role="tab"
        aria-selected={active === 'sign-in'}
        className={clsx(
          'flex-1 text-center py-2 rounded-card-xs text-sm font-semibold transition-colors duration-150 min-h-[44px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
          active === 'sign-in'
            ? 'bg-exp-navy-2 text-white shadow-card'
            : 'text-exp-muted hover:text-white',
        )}
      >
        Sign In
      </Link>
      <Link
        href="/register"
        role="tab"
        aria-selected={active === 'register'}
        className={clsx(
          'flex-1 text-center py-2 rounded-card-xs text-sm font-semibold transition-colors duration-150 min-h-[44px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
          active === 'register'
            ? 'bg-exp-navy-2 text-white shadow-card'
            : 'text-exp-muted hover:text-white',
        )}
      >
        Register
      </Link>
    </div>
  );
}
