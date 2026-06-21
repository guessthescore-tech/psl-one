import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyEmptyState } from '@/components/fantasy/shared/FantasyEmptyState';

export default function FantasyFixturesPage() {
  return (
    <FantasyShell
      title="Fixtures"
      subtitle="Upcoming gameweek fixtures"
    >
      <FantasyEmptyState
        title="Fixture list coming soon"
        message="Upcoming fixtures with difficulty ratings and deadline information will appear here for the active season."
        action={{ label: 'View matches', href: '/matches' }}
      />
    </FantasyShell>
  );
}
