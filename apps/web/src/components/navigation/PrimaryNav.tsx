'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { clearToken } from '@/lib/auth-client';
import { useWebSession } from '@/lib/use-session';

/* ── Route definitions ──────────────────────────────────────────── */
interface NavItem { href: string; label: string; exact?: boolean }

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/',             label: 'Home',         exact: true },
  { href: '/matches',      label: 'Matches'                   },
  { href: '/football',     label: 'Table'                     },
  { href: '/fantasy',      label: 'Fantasy'                   },
  { href: '/predictions',  label: 'Predictions'               },
  { href: '/leaderboards', label: 'Leaderboards'              },
  { href: '/clubs',        label: 'Clubs'                     },
  { href: '/players',      label: 'Players'                   },
  { href: '/media',        label: 'Media'                     },
];

/* ── Active state helper ────────────────────────────────────────── */
function isActive(href: string, pathname: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

/* ── Hamburger icon ─────────────────────────────────────────────── */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      )}
    </svg>
  );
}

/* ── PrimaryNav ─────────────────────────────────────────────────── */
export function PrimaryNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // useWebSession validates the JWT against /auth/me on mount and re-validates on
  // focus, storage events, and psl-auth-change. 'loading' renders a stable placeholder
  // so the header does not flash "Sign in" before the server responds.
  const { sessionState } = useWebSession();
  const showPlaceholder = sessionState === 'loading';
  // network-error: server unreachable but token present — show authenticated state
  // rather than unexpectedly signing the user out.
  const isAuthed = sessionState === 'authenticated' || sessionState === 'network-error';

  async function handleSignOut() {
    clearToken();
    setMenuOpen(false);
    window.location.href = '/';
  }

  return (
    <header className="sticky top-0 z-50 bg-psl-midnight shadow-card-lg">
      {/* ── Brand bar ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-3">

          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 font-black text-white text-lg tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-psl-midnight rounded"
          >
            PSL <span className="text-psl-gold">One</span>
          </Link>

          {/* Season badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-psl-gold/60 uppercase tracking-widest flex-shrink-0 select-none">
            <span className="w-1 h-1 rounded-full bg-psl-gold motion-safe:animate-live-pulse" aria-hidden />
            WC 2026 · Beta
          </div>

          {/* Desktop nav — scrollable at tablet sizes */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex flex-1 overflow-x-auto min-w-0"
            style={{ scrollbarWidth: 'none' }}
          >
            <ul className="flex items-stretch flex-nowrap" role="list">
              {PRIMARY_NAV_ITEMS.map(item => {
                const active = isActive(item.href, pathname, item.exact);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center h-14 px-3 lg:px-4 text-xs lg:text-sm font-semibold border-b-2 whitespace-nowrap motion-safe:transition-colors focus-visible:outline-none focus-visible:bg-white/5 ${
                        active
                          ? 'border-psl-gold text-white'
                          : 'border-transparent text-white/55 hover:text-white hover:border-white/25'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Spacer on mobile */}
          <div className="flex-1 md:hidden" aria-hidden />

          {/* Auth CTAs */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showPlaceholder ? (
              // Stable placeholder prevents layout shift while session is being validated
              <div className="hidden sm:block w-24 h-7" aria-hidden />
            ) : isAuthed ? (
              <>
                <Link
                  href="/account"
                  className="hidden sm:block text-xs font-semibold text-white/55 hover:text-white motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-psl-midnight rounded px-2 py-1.5"
                >
                  Account
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="hidden sm:block text-xs font-semibold text-white/55 hover:text-white motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-psl-midnight rounded px-2 py-1.5"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden sm:block text-xs font-semibold text-white/55 hover:text-white motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-psl-midnight rounded px-2 py-1.5"
              >
                Sign in
              </Link>
            )}
            <Link
              href="/register"
              className="text-xs font-black text-psl-midnight bg-psl-gold px-4 py-2 rounded-pill hover:bg-yellow-300 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-psl-midnight whitespace-nowrap"
            >
              Join Beta
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="flex md:hidden items-center justify-center w-9 h-9 text-white/70 hover:text-white hover:bg-white/10 rounded-lg motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold ml-1"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(o => !o)}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile slide-down menu ─────────────────────────────── */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-psl-midnight border-t border-white/10 pb-2"
        >
          <nav aria-label="Mobile menu navigation">
            <ul role="list">
              {PRIMARY_NAV_ITEMS.map(item => {
                const active = isActive(item.href, pathname, item.exact);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold border-l-2 motion-safe:transition-colors focus-visible:outline-none focus-visible:bg-white/5 min-h-[44px] ${
                        active
                          ? 'border-psl-gold text-white bg-white/5'
                          : 'border-transparent text-white/60 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              {!showPlaceholder && <li className="px-5 pt-3 pb-1 border-t border-white/10 mt-2 flex gap-3">
                {isAuthed ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 text-center text-sm font-semibold text-white/70 border border-white/20 py-2.5 rounded-card-sm hover:bg-white/10 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold"
                    >
                      Account
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex-1 text-center text-sm font-semibold text-white/70 border border-white/20 py-2.5 rounded-card-sm hover:bg-white/10 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center text-sm font-semibold text-white/70 border border-white/20 py-2.5 rounded-card-sm hover:bg-white/10 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold"
                  >
                    Sign in
                  </Link>
                )}
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center text-sm font-black text-psl-midnight bg-psl-gold py-2.5 rounded-card-sm hover:bg-yellow-300 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold"
                >
                  Join Beta
                </Link>
              </li>}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
