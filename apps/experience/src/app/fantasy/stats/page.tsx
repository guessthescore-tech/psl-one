import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyEmptyState } from '@/components/fantasy/shared/FantasyEmptyState';

export default function FantasyStatsPage() {
  return (
    <FantasyShell
      title="Stats"
      subtitle="Fantasy season analytics"
    >
      <FantasyEmptyState
        title="Season stats coming soon"
        message="Your fantasy season statistics, chip usage analysis, and comparison against the average manager will appear here."
        action={{ label: 'View my squad', href: '/fantasy/team' }}
      />
    </FantasyShell>
  );
}
