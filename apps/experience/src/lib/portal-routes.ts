/**
 * PSL One — Portal Route Constants
 *
 * PSL_INACTIVE - do not activate PSL season
 * WALLET_SANDBOX_ONLY - no production wallet
 * FANTASY_POINTS_ONLY - no real-money fantasy
 * GTS_POINTS_ONLY - no real-money guess the score
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_PRODUCTION_INGESTION
 * NO_SCHEDULED_INGESTION
 * NO_REAL_MONEY
 */

// ── Admin Portal Routes ────────────────────────────────────────────────────

export const ADMIN_ROUTES = {
  ROOT: '/admin',
  OVERVIEW: '/admin/overview',
  COMPETITIONS: '/admin/competitions',
  SEASONS: '/admin/seasons',
  FIXTURES: '/admin/fixtures',
  TEAMS: '/admin/teams',
  PLAYERS: '/admin/players',
  RULES: '/admin/rules',
  RULES_GTS: '/admin/rules/guess-the-score',
  RULES_FANTASY: '/admin/rules/fantasy',
  POINTS: '/admin/points',
  POINTS_SIMULATION: '/admin/points/simulation',
  LEADERBOARDS: '/admin/leaderboards',
  CHALLENGES: '/admin/challenges',
  CAMPAIGNS: '/admin/campaigns',
  SPONSORS: '/admin/sponsors',
  CLUBS: '/admin/clubs',
  USERS: '/admin/users',
  ROLES: '/admin/roles',
  AUDIT: '/admin/audit',
  SETTINGS: '/admin/settings',
  READINESS: '/admin/readiness',
} as const;

export type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];

// ── Club Portal Routes ─────────────────────────────────────────────────────

export const CLUB_ROUTES = {
  ROOT: '/club',
  OVERVIEW: '/club/overview',
  PROFILE: '/club/profile',
  SQUAD: '/club/squad',
  PLAYERS: '/club/players',
  FIXTURES: '/club/fixtures',
  RESULTS: '/club/results',
  FANS: '/club/fans',
  CONTENT: '/club/content',
  CAMPAIGNS: '/club/campaigns',
  SPONSORS: '/club/sponsors',
  ANALYTICS: '/club/analytics',
  SUPPORTERS: '/club/supporters',
  SETTINGS: '/club/settings',
} as const;

export type ClubRoute = (typeof CLUB_ROUTES)[keyof typeof CLUB_ROUTES];

// ── Sponsor Portal Routes ──────────────────────────────────────────────────

export const SPONSOR_ROUTES = {
  ROOT: '/sponsor',
  OVERVIEW: '/sponsor/overview',
  PROFILE: '/sponsor/profile',
  CAMPAIGNS: '/sponsor/campaigns',
  CAMPAIGNS_NEW: '/sponsor/campaigns/new',
  AUDIENCES: '/sponsor/audiences',
  ACTIVATIONS: '/sponsor/activations',
  REWARDS: '/sponsor/rewards',
  ANALYTICS: '/sponsor/analytics',
  CLUBS: '/sponsor/clubs',
  ASSETS: '/sponsor/assets',
  BILLING_PLACEHOLDER: '/sponsor/billing-placeholder',
  SETTINGS: '/sponsor/settings',
} as const;

export type SponsorRoute = (typeof SPONSOR_ROUTES)[keyof typeof SPONSOR_ROUTES];

// ── Nav item type ──────────────────────────────────────────────────────────

export type NavItem = {
  label: string;
  href: string;
  group?: string;
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Overview',      href: ADMIN_ROUTES.OVERVIEW,         group: 'Platform' },
  { label: 'Competitions',  href: ADMIN_ROUTES.COMPETITIONS,     group: 'Platform' },
  { label: 'Seasons',       href: ADMIN_ROUTES.SEASONS,          group: 'Platform' },
  { label: 'Fixtures',      href: ADMIN_ROUTES.FIXTURES,         group: 'Platform' },
  { label: 'Teams',         href: ADMIN_ROUTES.TEAMS,            group: 'Entities' },
  { label: 'Players',       href: ADMIN_ROUTES.PLAYERS,          group: 'Entities' },
  { label: 'Clubs',         href: ADMIN_ROUTES.CLUBS,            group: 'Entities' },
  { label: 'GTS Rules',     href: ADMIN_ROUTES.RULES_GTS,        group: 'Rules' },
  { label: 'Fantasy Rules', href: ADMIN_ROUTES.RULES_FANTASY,    group: 'Rules' },
  { label: 'Points',        href: ADMIN_ROUTES.POINTS,           group: 'Rules' },
  { label: 'Simulation',    href: ADMIN_ROUTES.POINTS_SIMULATION, group: 'Rules' },
  { label: 'Leaderboards',  href: ADMIN_ROUTES.LEADERBOARDS,     group: 'Engagement' },
  { label: 'Challenges',    href: ADMIN_ROUTES.CHALLENGES,       group: 'Engagement' },
  { label: 'Campaigns',     href: ADMIN_ROUTES.CAMPAIGNS,        group: 'Engagement' },
  { label: 'Sponsors',      href: ADMIN_ROUTES.SPONSORS,         group: 'Partnerships' },
  { label: 'Users',         href: ADMIN_ROUTES.USERS,            group: 'Admin' },
  { label: 'Roles',         href: ADMIN_ROUTES.ROLES,            group: 'Admin' },
  { label: 'Audit Log',     href: ADMIN_ROUTES.AUDIT,            group: 'Admin' },
  { label: 'Settings',      href: ADMIN_ROUTES.SETTINGS,         group: 'Admin' },
  { label: 'Readiness',     href: ADMIN_ROUTES.READINESS,        group: 'Admin' },
];

export const CLUB_NAV_ITEMS: NavItem[] = [
  { label: 'Overview',   href: CLUB_ROUTES.OVERVIEW,   group: 'Club' },
  { label: 'Profile',    href: CLUB_ROUTES.PROFILE,    group: 'Club' },
  { label: 'Squad',      href: CLUB_ROUTES.SQUAD,      group: 'Players' },
  { label: 'Players',    href: CLUB_ROUTES.PLAYERS,    group: 'Players' },
  { label: 'Fixtures',   href: CLUB_ROUTES.FIXTURES,   group: 'Schedule' },
  { label: 'Results',    href: CLUB_ROUTES.RESULTS,    group: 'Schedule' },
  { label: 'Fans',       href: CLUB_ROUTES.FANS,       group: 'Community' },
  { label: 'Supporters', href: CLUB_ROUTES.SUPPORTERS, group: 'Community' },
  { label: 'Content',    href: CLUB_ROUTES.CONTENT,    group: 'Media' },
  { label: 'Campaigns',  href: CLUB_ROUTES.CAMPAIGNS,  group: 'Media' },
  { label: 'Sponsors',   href: CLUB_ROUTES.SPONSORS,   group: 'Partnerships' },
  { label: 'Analytics',  href: CLUB_ROUTES.ANALYTICS,  group: 'Insights' },
  { label: 'Settings',   href: CLUB_ROUTES.SETTINGS,   group: 'Admin' },
];

export const SPONSOR_NAV_ITEMS: NavItem[] = [
  { label: 'Overview',    href: SPONSOR_ROUTES.OVERVIEW,            group: 'Sponsor' },
  { label: 'Profile',     href: SPONSOR_ROUTES.PROFILE,             group: 'Sponsor' },
  { label: 'Campaigns',   href: SPONSOR_ROUTES.CAMPAIGNS,           group: 'Campaigns' },
  { label: 'New Campaign',href: SPONSOR_ROUTES.CAMPAIGNS_NEW,       group: 'Campaigns' },
  { label: 'Audiences',   href: SPONSOR_ROUTES.AUDIENCES,           group: 'Targeting' },
  { label: 'Activations', href: SPONSOR_ROUTES.ACTIVATIONS,         group: 'Targeting' },
  { label: 'Rewards',     href: SPONSOR_ROUTES.REWARDS,             group: 'Engagement' },
  { label: 'Analytics',   href: SPONSOR_ROUTES.ANALYTICS,           group: 'Insights' },
  { label: 'Clubs',       href: SPONSOR_ROUTES.CLUBS,               group: 'Partnerships' },
  { label: 'Assets',      href: SPONSOR_ROUTES.ASSETS,              group: 'Partnerships' },
  { label: 'Billing',     href: SPONSOR_ROUTES.BILLING_PLACEHOLDER, group: 'Admin' },
  { label: 'Settings',    href: SPONSOR_ROUTES.SETTINGS,            group: 'Admin' },
];
