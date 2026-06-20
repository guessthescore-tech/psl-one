import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyEmptyState } from '@/components/fantasy/shared/FantasyEmptyState';

export default function FantasyPointsPage() {
  return (
    <FantasyShell
      title="Points History"
      subtitle="Your gameweek-by-gameweek performance"
    >
      <FantasyEmptyState
        title="Points history coming soon"
        message="Your gameweek scores, rank changes, and bonus points will appear here once a gameweek has been played."
        action={{ label: 'View my squad', href: '/fantasy/team' }}
      />
    </FantasyShell>
  );
}
