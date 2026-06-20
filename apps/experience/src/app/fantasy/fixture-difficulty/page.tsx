'use client';

import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyPageHero } from '@/components/fantasy/shared/FantasyPageHero';
import { FixtureDifficultyMatrix } from '@/components/fantasy/core/FixtureDifficultyMatrix';
import { FANTASY_MOCK_FDR } from '@/lib/data';

// FDR page is DESIGN_REVIEW_DATA only — backend API not yet available
// FantasyShell automatically renders the purple design review banner

export default function FixtureDifficultyPage() {
  return (
    <FantasyShell
      title="Fixture Difficulty"
      back={{ href: '/fantasy/team', label: 'Back to Team' }}
    >
      <div className="pb-8">
        <FantasyPageHero
          title="Fixture Difficulty"
          subtitle="Next 6 gameweeks — plan your transfers and chip strategy"
          badge="DESIGN REVIEW DATA"
        />

        <div className="px-4 py-4">
          <FixtureDifficultyMatrix
            data={FANTASY_MOCK_FDR}
            gameweekLabels={['GW1', 'GW2', 'GW3', 'GW4', 'GW5', 'GW6']}
          />
        </div>

        <div className="px-4 pb-4 space-y-2">
          <div className="bg-exp-navy border border-exp-border-dk rounded-card-xs px-4 py-3">
            <p className="text-label-md text-white font-semibold mb-1">How to use FDR</p>
            <ul className="space-y-1 text-body-sm text-exp-muted">
              <li>• Green = easier fixture (target players from these teams)</li>
              <li>• Red = harder fixture (avoid or sell these players)</li>
              <li>• Use FDR to time your transfers and chips</li>
              <li>• H = home game · A = away game</li>
            </ul>
          </div>
          <p className="text-label-sm text-exp-muted text-center">
            Points only — no real money or financial value
          </p>
        </div>
      </div>
    </FantasyShell>
  );
}
