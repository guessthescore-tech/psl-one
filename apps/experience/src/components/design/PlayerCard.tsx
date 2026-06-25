import { clsx } from 'clsx';

interface PlayerCardClub {
  name: string;
  abbr: string;
  primaryColor: string;
}

interface PlayerCardProps {
  name: string;
  position: string;
  club: PlayerCardClub;
  price: number;
  score?: number;
  imageUrl?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(p => p[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function PlayerCard({
  name,
  position,
  club,
  price,
  score,
  imageUrl,
}: PlayerCardProps) {
  const initials = getInitials(name);

  return (
    <div
      className={clsx(
        'w-[160px] flex-shrink-0 rounded-card bg-exp-ink border border-exp-border-dk shadow-card-md overflow-hidden',
        'flex flex-col',
      )}
    >
      {/* Image / initials area */}
      <div
        className="relative h-[120px] flex items-center justify-center overflow-hidden"
        style={
          !imageUrl
            ? {
                background: `linear-gradient(160deg, ${club.primaryColor}88 0%, ${club.primaryColor}33 100%)`,
              }
            : undefined
        }
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <span
            className="text-4xl font-black text-white/90 select-none"
            aria-hidden
          >
            {initials}
          </span>
        )}

        {/* Club badge overlay */}
        <div
          className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shadow-card"
          style={{ backgroundColor: club.primaryColor, color: '#fff' }}
          aria-label={`Club: ${club.name}`}
        >
          {club.abbr.slice(0, 3)}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        {/* Position chip */}
        <span className="text-label-sm text-exp-gold bg-exp-gold/10 rounded-pill px-2 py-0.5 self-start uppercase">
          {position}
        </span>

        {/* Name */}
        <p className="text-label-lg text-white leading-tight line-clamp-2">{name}</p>

        {/* Price + score row */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-body-sm text-exp-gold font-bold">
            {price.toFixed(1)}m
          </span>
          {score !== undefined && (
            <span className="text-label-md text-exp-green font-black bg-exp-green/10 rounded-card-xs px-2 py-0.5">
              {score} pts
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
