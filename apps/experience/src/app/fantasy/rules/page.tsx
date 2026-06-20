import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyEmptyState } from '@/components/fantasy/shared/FantasyEmptyState';

export default function FantasyRulesPage() {
  return (
    <FantasyShell
      title="Fantasy Rules"
      subtitle="How the game works"
    >
      <FantasyEmptyState
        title="Rules guide coming soon"
        message="Scoring rules, transfer limits, chip usage, and deadline information will be published here when the PSL fantasy season opens."
        action={{ label: 'View my squad', href: '/fantasy/team' }}
      />
    </FantasyShell>
  );
}
