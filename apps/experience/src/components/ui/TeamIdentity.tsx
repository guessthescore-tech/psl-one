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
      {/* Shield-shaped badge — more football-authentic than a circle */}
      <div
        className={clsx(
          'relative flex items-center justify-center font-black shadow-card flex-shrink-0',
          'rounded-[28%_28%_50%_50%/20%_20%_40%_40%]',
          s.badge,
        )}
        style={{
          backgroundColor: club.primaryColor,
          color: club.textColor,
          boxShadow: `0 2px 8px ${club.primaryColor}55`,
          borderBottom: `2px solid ${club.secondaryColor}66`,
        }}
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
