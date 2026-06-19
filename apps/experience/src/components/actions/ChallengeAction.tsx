import Link from 'next/link';
import { Sword } from '@phosphor-icons/react/dist/ssr';
import type { ExpFixture } from '@/lib/data';

interface ChallengeActionProps {
  fixture: ExpFixture;
  compact?: boolean;
}

export function ChallengeAction({ fixture, compact = false }: ChallengeActionProps) {
  return (
    <Link
      href={`/predict/challenge?fixture=${fixture.id}`}
      className={`inline-flex items-center gap-2 border border-white/20 text-white bg-white/8 rounded-pill hover:bg-white/15 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold ${
        compact
          ? 'text-xs px-3 py-1.5 min-h-[36px]'
          : 'text-sm font-semibold px-5 py-2.5 min-h-[44px]'
      }`}
      aria-label={`Challenge a fan on ${fixture.homeClub.shortName} vs ${fixture.awayClub.shortName}`}
    >
      <Sword size={compact ? 14 : 18} weight="bold" aria-hidden />
      Challenge a fan
    </Link>
  );
}
