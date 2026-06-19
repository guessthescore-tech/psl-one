'use client';

import { useState } from 'react';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { ManagerSearch } from '@/components/fantasy/leagues/ManagerSearch';
import { ManagerFilters } from '@/components/fantasy/leagues/ManagerFilters';

type FilterId = 'ALL' | 'MY_LEAGUES' | 'FRIENDS';

// DESIGN_REVIEW_DATA only — GET /api/fantasy/search doesn't exist yet.

export default function ManagerSearchPage() {
  const [filter, setFilter] = useState<FilterId>('ALL');

  return (
    <FantasyShell
      title="Manager Search"
      subtitle="Find other managers by name or team"
      back={{ href: '/fantasy/leagues', label: 'Leagues' }}
    >
      <ManagerFilters active={filter} onChange={setFilter} />
      <ManagerSearch filter={filter} />
    </FantasyShell>
  );
}
