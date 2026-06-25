/**
 * Beta placeholder crest — replace with licensed artwork when available.
 */
import { clsx } from 'clsx';

interface ClubCrestClub {
  name: string;
  abbr: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

type CrestSize = 'sm' | 'md' | 'lg' | 'xl';

interface ClubCrestProps {
  club: ClubCrestClub;
  size?: CrestSize;
}

const SIZE_MAP: Record<CrestSize, { container: string; text: string }> = {
  sm: { container: 'w-8 h-8 text-[10px]',   text: 'text-[10px]' },
  md: { container: 'w-12 h-12 text-xs',       text: 'text-xs' },
  lg: { container: 'w-16 h-16 text-sm',       text: 'text-sm' },
  xl: { container: 'w-24 h-24 text-base',     text: 'text-base' },
};

export function ClubCrest({ club, size = 'md' }: ClubCrestProps) {
  const s = SIZE_MAP[size];

  return (
    <div
      /* Shield shape identical to TeamIdentity */
      className={clsx(
        'relative flex items-center justify-center font-black shadow-card flex-shrink-0',
        'rounded-[28%_28%_50%_50%/20%_20%_40%_40%]',
        s.container,
      )}
      style={{
        backgroundColor: club.primaryColor,
        color: club.textColor,
        boxShadow: `0 2px 8px ${club.primaryColor}55`,
        borderBottom: `2px solid ${club.secondaryColor}66`,
      }}
      aria-label={`${club.name} crest (placeholder)`}
      role="img"
    >
      <span className={clsx('select-none leading-none', s.text)}>
        {club.abbr.slice(0, 3)}
      </span>
    </div>
  );
}
