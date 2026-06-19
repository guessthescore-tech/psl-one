'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { House, CalendarBlank, Users, Trophy, UserCircle } from '@phosphor-icons/react/dist/ssr';

const NAV = [
  { label: 'Home',     href: '/',           Icon: House          },
  { label: 'Fixtures', href: '/fixtures',   Icon: CalendarBlank  },
  { label: 'Fantasy',  href: '/fantasy',    Icon: Trophy         },
  { label: 'Clubs',    href: '/clubs',      Icon: Users          },
  { label: 'Account',  href: '/account',    Icon: UserCircle     },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-40 bg-exp-void/95 backdrop-blur-sm border-b border-exp-border-dk"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-sm"
            aria-label="PSL One home"
          >
            <div
              className="w-7 h-7 rounded-[6px] flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#00843d,#1b3a6b)' }}
              aria-hidden
            >
              <span className="text-white font-black text-xs leading-none">P</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-black text-sm tracking-tight">PSL</span>
              <span className="text-exp-gold font-black text-sm tracking-tight ml-0.5">One</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary navigation"
          >
            {NAV.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'px-3.5 py-2 rounded-card-xs text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold',
                    active
                      ? 'text-white bg-white/10'
                      : 'text-white/55 hover:text-white hover:bg-white/8',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-white/55 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-sm px-1"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-exp-gold text-exp-void text-sm font-bold px-4 py-2 rounded-pill hover:bg-exp-gold-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-exp-void min-h-[44px] flex items-center"
            >
              Join free
            </Link>
          </div>

          {/* Mobile menu icon — bottom nav handles mobile, this is a fallback label */}
          <div className="md:hidden">
            <Link
              href="/account"
              className="w-9 h-9 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold"
              aria-label="Account"
            >
              <UserCircle size={22} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
