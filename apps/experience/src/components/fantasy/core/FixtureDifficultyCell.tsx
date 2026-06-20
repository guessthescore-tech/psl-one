'use client';

type Difficulty = 1 | 2 | 3 | 4 | 5;

interface FixtureDifficultyCellProps {
  opponent: string;
  difficulty: Difficulty;
  isHome: boolean;
}

const difficultyBg: Record<Difficulty, string> = {
  1: 'bg-green-600',
  2: 'bg-green-400',
  3: 'bg-amber-400',
  4: 'bg-orange-500',
  5: 'bg-red-600',
};

const difficultyLabel: Record<Difficulty, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard',
};

export function FixtureDifficultyCell({ opponent, difficulty, isHome }: FixtureDifficultyCellProps) {
  return (
    <td
      className={`text-center py-2 px-1 ${difficultyBg[difficulty]}`}
      title={`vs ${opponent} (${isHome ? 'H' : 'A'}) — ${difficultyLabel[difficulty]}`}
      aria-label={`${opponent}, ${isHome ? 'home' : 'away'}, difficulty ${difficulty} out of 5`}
    >
      <div className="flex flex-col items-center leading-tight">
        <span className="text-label-sm text-white font-bold">{opponent}</span>
        <span className="text-[9px] text-white/70">{isHome ? 'H' : 'A'}</span>
      </div>
    </td>
  );
}
