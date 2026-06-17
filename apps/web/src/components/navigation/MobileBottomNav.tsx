'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ── Route definitions ──────────────────────────────────────────── */
interface BottomNavItem { href: string; label: string; exact?: boolean }

const BOTTOM_NAV: BottomNavItem[] = [
  { href: '/',            label: 'Home',    exact: true },
  { href: '/matches',     label: 'Matches'              },
  { href: '/fantasy',     label: 'Fantasy'              },
  { href: '/predictions', label: 'Predict'              },
  { href: '/profile',     label: 'Profile'              },
];

/* ── Active state helper ────────────────────────────────────────── */
function isActive(href: string, pathname: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

/* ── Icons ──────────────────────────────────────────────────────── */
function HomeIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.75} aria-hidden>
      {filled ? (
        <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.06 1.06l8.69-8.69ZM12 5.43l7.72 7.72V18a1.5 1.5 0 0 1-1.5 1.5h-4.5v-3.75a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75V19.5H6.75A1.5 1.5 0 0 1 5.25 18V13.15L12 5.43Z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      )}
    </svg>
  );
}

function MatchIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.75} aria-hidden>
      {filled ? (
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.902 7.098a3.75 3.75 0 0 1 5.305 5.305 3.75 3.75 0 0 1-5.305-5.305Zm-3.402-.21a9.28 9.28 0 0 1 1.67-1.578l1.055 1.055a5.25 5.25 0 0 0-.79 1.054 5.25 5.25 0 0 0-.79 1.054L7.786 9.138a9.278 9.278 0 0 1-.09-.0Zm6.426 8.596c.494-.187.964-.43 1.406-.727l1.055 1.055a9.278 9.278 0 0 1-1.578 1.67L14.5 17.628a5.25 5.25 0 0 0 .622-.684Z" clipRule="evenodd" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25a9.75 9.75 0 1 0 0 19.5A9.75 9.75 0 0 0 12 2.25Zm0 0v2.25m0 15v2.25M2.25 12h2.25m15 0h2.25M5.636 5.636l1.591 1.591m9.546 9.546 1.591 1.591M5.636 18.364l1.591-1.591m9.546-9.546 1.591-1.591" />
      )}
    </svg>
  );
}

function FantasyIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.75} aria-hidden>
      {filled ? (
        <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0 0 4.5h7.5a2.25 2.25 0 0 0 0-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.798 49.798 0 0 0-6.093-.377.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clipRule="evenodd" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
      )}
    </svg>
  );
}

function PredictIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.75} aria-hidden>
      {filled ? (
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      )}
    </svg>
  );
}

function ProfileIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.75} aria-hidden>
      {filled ? (
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      )}
    </svg>
  );
}

const ICONS = {
  '/':            HomeIcon,
  '/matches':     MatchIcon,
  '/fantasy':     FantasyIcon,
  '/predictions': PredictIcon,
  '/profile':     ProfileIcon,
} as const;

/* ── MobileBottomNav ────────────────────────────────────────────── */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[#e8eaf0] md:hidden"
      aria-label="Mobile bottom navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5 h-14 max-w-lg mx-auto" role="list">
        {BOTTOM_NAV.map(item => {
          const active = isActive(item.href, pathname, item.exact);
          const Icon = ICONS[item.href as '/' | '/matches' | '/fantasy' | '/predictions' | '/profile'] ?? HomeIcon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] h-14 text-[10px] font-bold motion-safe:transition-colors focus-visible:outline-none focus-visible:bg-psl-navy/5 w-full ${
                  active ? 'text-psl-navy' : 'text-gray-400 hover:text-psl-navy'
                }`}
              >
                <Icon filled={active} />
                <span>{item.label}</span>
                {active && <span className="absolute bottom-0 h-0.5 w-8 bg-psl-gold rounded-t-full" aria-hidden />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
