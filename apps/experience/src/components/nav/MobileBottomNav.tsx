'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { House, Sword, Trophy, Target, UserCircle } from '@phosphor-icons/react/dist/ssr';

function NavItem({
  href,
  label,
  Icon,
  active,
  reduce,
}: {
  href: string;
  label: string;
  Icon: React.ElementType;
  active: boolean;
  reduce: boolean | null;
}) {
  return (
    <Link
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
        <Icon size={22} weight={active ? 'fill' : 'regular'} aria-hidden />
        {active && !reduce && (
          <motion.div
            layoutId="nav-bottom-indicator"
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
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-exp-void/97 backdrop-blur-md border-t border-exp-border-dk pb-safe"
      aria-label="Mobile navigation"
      role="navigation"
    >
      <div className="flex items-stretch h-14">
        <NavItem href="/" label="Home" Icon={House} active={isActive('/')} reduce={reduce} />
        <NavItem href="/matches" label="Matches" Icon={Sword} active={isActive('/matches')} reduce={reduce} />
        <NavItem href="/fantasy" label="Fantasy" Icon={Trophy} active={isActive('/fantasy')} reduce={reduce} />
        <NavItem href="/predict" label="Predict" Icon={Target} active={isActive('/predict')} reduce={reduce} />
        <NavItem href="/account" label="Profile" Icon={UserCircle} active={isActive('/account')} reduce={reduce} />
      </div>
    </nav>
  );
}
