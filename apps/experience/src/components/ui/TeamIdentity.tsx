import { clsx } from 'clsx';
import type { ExpClub } from '@/lib/data';

interface TeamIdentityProps {
  club: ExpClub;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  nameClass?: string;
}

const SIZE = {
  sm:  { badge: 'w-8 h-8   text-[10px]', gap: 'gap-2', name: 'text-xs'     },
  md:  { badge: 'w-11 h-11 text-xs',     gap: 'gap-2.5', name: 'text-sm'   },
  lg:  { badge: 'w-14 h-14 text-sm',     gap: 'gap-3',   name: 'text-base' },
  xl:  { badge: 'w-20 h-20 text-base',   gap: 'gap-4',   name: 'text-lg'   },
};

export function TeamIdentity({
  club,
  size = 'md',
  showName = false,
  nameClass,
}: TeamIdentityProps) {
  const s = SIZE[size];

  return (
    <div className={clsx('flex flex-col items-center', s.gap)}>
      <div
        className={clsx(
          'rounded-full flex items-center justify-center font-black shadow-card flex-shrink-0',
          s.badge,
        )}
        style={{ backgroundColor: club.primaryColor, color: club.textColor }}
        aria-hidden
      >
        {club.abbr}
      </div>
      {showName && (
        <span
          className={clsx(
            'font-semibold text-center leading-tight',
            nameClass ?? 'text-white',
            s.name,
          )}
        >
          {club.shortName}
        </span>
      )}
    </div>
  );
}
