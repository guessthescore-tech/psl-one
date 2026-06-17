'use client';

import Image from 'next/image';
import { useState } from 'react';

/* ── Flag emoji map (ISO 3166-1 alpha-3 → Unicode flag) ─────────── */
const FLAG: Record<string, string> = {
  ARG: '🇦🇷', AUS: '🇦🇺', BEL: '🇧🇪', BRA: '🇧🇷',
  CMR: '🇨🇲', CAN: '🇨🇦', CHI: '🇨🇱', COL: '🇨🇴',
  CRO: '🇭🇷', DEN: '🇩🇰', ECU: '🇪🇨', EGY: '🇪🇬',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ESP: '🇪🇸', FRA: '🇫🇷',
  GER: '🇩🇪', GHA: '🇬🇭', ITA: '🇮🇹', JPN: '🇯🇵',
  KOR: '🇰🇷', MAR: '🇲🇦', MEX: '🇲🇽', NED: '🇳🇱',
  NGA: '🇳🇬', POL: '🇵🇱', POR: '🇵🇹', RSA: '🇿🇦',
  SEN: '🇸🇳', SRB: '🇷🇸', SUI: '🇨🇭', SWE: '🇸🇪',
  URU: '🇺🇾', USA: '🇺🇸', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', ZAF: '🇿🇦',
};

export function getCountryFlag(code: string): string {
  return FLAG[code.toUpperCase()] ?? '';
}

/* ── Size map ───────────────────────────────────────────────────── */
const SIZE: Record<string, { px: number; cls: string; text: string }> = {
  xs: { px: 24, cls: 'w-6 h-6',  text: 'text-[9px]'  },
  sm: { px: 32, cls: 'w-8 h-8',  text: 'text-[10px]' },
  md: { px: 40, cls: 'w-10 h-10', text: 'text-xs'   },
  lg: { px: 56, cls: 'w-14 h-14', text: 'text-sm'   },
  xl: { px: 72, cls: 'w-18 h-18', text: 'text-base' },
};

interface TeamCrestProps {
  name: string;
  shortName: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  size?: keyof typeof SIZE;
  className?: string;
  showFlag?: boolean;
}

/**
 * Renders a team crest.
 * Tries logoUrl first (Next.js Image); falls back to initials with optional flag emoji.
 */
export function TeamCrest({
  name,
  shortName,
  logoUrl,
  primaryColor,
  size = 'md',
  className = '',
  showFlag = false,
}: TeamCrestProps) {
  const [imgError, setImgError] = useState(false);
  const { px, cls, text } = SIZE[size] ?? SIZE['md']!;
  const bg = primaryColor ?? '#1b3a6b';
  const initials = shortName.slice(0, 3).toUpperCase();
  const flag = showFlag ? getCountryFlag(shortName) : '';

  if (logoUrl && !imgError) {
    return (
      <div
        className={`${cls} rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center ${className}`}
        title={name}
      >
        <Image
          src={logoUrl}
          width={px}
          height={px}
          alt={`${name} crest`}
          className="w-full h-full object-contain p-0.5"
          onError={() => setImgError(true)}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center font-black flex-shrink-0 select-none ${text} ${className}`}
      style={{ backgroundColor: bg }}
      title={name}
      aria-label={name}
    >
      {flag ? (
        <span className="text-base leading-none" aria-hidden>{flag}</span>
      ) : (
        <span className="text-white">{initials}</span>
      )}
    </div>
  );
}
