'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { House, Sword, Trophy, Target, UserCircle } from '@phosphor-icons/react/dist/ssr';

const TABS = [
  { label: 'Home',    href: '/',        Icon: House       },
  { label: 'Matches', href: '/matches', Icon: Sword       },
  { label: 'Fantasy', href: '/fantasy', Icon: Trophy      },
  { label: 'Predict', href: '/predict', Icon: Target      },
  { label: 'Profile', href: '/account', Icon: UserCircle  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-exp-void/97 backdrop-blur-md border-t border-exp-border-dk pb-safe"
      aria-label="Mobile navigation"
      role="navigation"
    >
      <div className="flex items-stretch h-14">
        {TABS.map(({ label, href, Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold focus-visible:ring-inset',
                'min-h-[44px]',
                active ? 'text-exp-gold' : 'text-white/45 hover:text-white/75',
              )}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  size={22}
                  weight={active ? 'fill' : 'regular'}
                  aria-hidden
                />
                {active && !reduce && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-exp-gold"
                    aria-hidden
                    transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
                  />
                )}
                {active && reduce && (
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-exp-gold"
                    aria-hidden
                  />
                )}
              </div>
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
