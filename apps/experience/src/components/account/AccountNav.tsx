'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  User,
  Lock,
  Heart,
  Trash,
  CaretRight,
} from '@phosphor-icons/react/dist/ssr';

const NAV_ITEMS = [
  { label: 'Edit Profile',    href: '/account/profile',       Icon: User  },
  { label: 'Security',        href: '/account/security',      Icon: Lock  },
  { label: 'Favourite Team',  href: '/account/favourite-team', Icon: Heart },
  { label: 'Delete Account',  href: '/account/delete',        Icon: Trash },
];

interface AccountNavProps {
  onSignOut?: () => void;
}

/**
 * Vertical nav links for the account section.
 * Highlights the active route. Includes a Sign Out button at the bottom.
 */
export function AccountNav({ onSignOut }: AccountNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Account navigation" className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ label, href, Icon }) => {
        const active = pathname === href;
        const destructive = href === '/account/delete';
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-card-sm transition-colors duration-150 min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
              active
                ? 'bg-exp-navy-2/60 text-white'
                : destructive
                  ? 'text-exp-live/80 hover:text-exp-live hover:bg-exp-live/10'
                  : 'text-exp-muted hover:text-white hover:bg-white/5',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={18} aria-hidden />
            <span className="text-body-md font-medium flex-1">{label}</span>
            <CaretRight size={14} aria-hidden className="opacity-40" />
          </Link>
        );
      })}

      {/* Sign Out */}
      <div className="mt-2 pt-2 border-t border-exp-border-dk">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-card-sm text-exp-muted hover:text-white hover:bg-white/5 transition-colors duration-150 min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
        >
          <span className="text-body-md font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
