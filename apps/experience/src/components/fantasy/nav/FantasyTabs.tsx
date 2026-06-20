'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const TABS = [
  { label: 'Overview',  href: '/fantasy' },
  { label: 'My Team',   href: '/fantasy/team' },
  { label: 'Points',    href: '/fantasy/points' },
  { label: 'Transfers', href: '/fantasy/team/transfers' },
  { label: 'Leagues',   href: '/fantasy/leagues' },
  { label: 'Fixtures',  href: '/fantasy/fixtures' },
  { label: 'Stats',     href: '/fantasy/stats' },
  { label: 'History',   href: '/fantasy/history' },
  { label: 'Rules',     href: '/fantasy/rules' },
] as const;

export function FantasyTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Fantasy navigation"
      className="overflow-x-auto scrollbar-none -mx-4 sm:-mx-6 lg:-mx-8"
    >
      <div className="flex items-end gap-1 px-4 sm:px-6 lg:px-8 min-w-max">
        {TABS.map(({ label, href }) => {
          const active =
            href === '/fantasy'
              ? pathname === '/fantasy'
              : pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'inline-flex items-center px-3.5 pb-3 pt-1 text-sm font-semibold whitespace-nowrap transition-colors duration-150 border-b-2 min-h-[44px]',
                'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                active
                  ? 'text-exp-gold border-exp-gold'
                  : 'text-white/50 hover:text-white border-transparent',
              )}
              aria-current={active ? 'page' : undefined}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
