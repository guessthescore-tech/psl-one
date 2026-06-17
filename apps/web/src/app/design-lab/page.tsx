'use client';

import Link from 'next/link';

const DEMOS = [
  {
    href: '/design-lab/in-season-home',
    title: 'In-Season League Home',
    description:
      'Dense, data-rich league homepage. Fixture rail, live table, fantasy status, top scorers, media, clubs and sponsor placement — all from real API data.',
    desktopPreview: 'Multi-column layout · Sticky navigation · Matchweek selector · Live fixture rail',
    mobilePreview:  'Single-column · Bottom navigation · Horizontal scroll sections · Safe-area aware',
    rationale:
      'Mirrors the information hierarchy of major European league sites. Puts fixtures first, with contextual modules reordering by season state.',
    components: ['FixtureRail', 'LeagueTableSnapshot', 'FantasyManagerCard', 'TopPerformersRail', 'MediaRail', 'FanValueCard'],
    accent: '#1b3a6b',
    label: 'A',
  },
  {
    href: '/design-lab/prediction-carousel',
    title: 'Prediction Fixture Carousel',
    description:
      'Swipeable fixture prediction carousel. Horizontal drag on desktop, touch swipe on mobile, keyboard navigation, snap-to-card, Home/Draw/Away selection and community percentages.',
    desktopPreview: 'Drag-to-scroll · Adjacent card peek · Keyboard arrows · Pagination dots',
    mobilePreview:  'Touch swipe · Snap behaviour · Full-card view · Thumb-accessible buttons',
    rationale:
      'Inspired by Sofascore prediction carousels. Points-only framing with no odds, no stakes and no cash language. ARIA-accessible.',
    components: ['FixturePredictionCarousel', 'PredictionCard', 'CountdownTimer', 'PredictionSkeleton'],
    accent: '#00843d',
    label: 'B',
  },
  {
    href: '/design-lab/fantasy-hub',
    title: 'Fantasy In-Season Hub',
    description:
      'Dense fantasy dashboard. Manager card, squad pitch view, deadline countdown, player stats, mini-league, gameweek history and transfer management — from the real fantasy API.',
    desktopPreview: 'Pitch view · Multi-column stats · Mini-league table · Gameweek timeline',
    mobilePreview:  'Pitch on mobile · Swipe between starters and bench · Bottom action bar',
    rationale:
      'Benchmarks against FPL density without copying layout pixel-for-pixel. Dark immersive theme for gameplay areas, light for stats.',
    components: ['FantasyPitch', 'FantasyManagerCard', 'FantasyPlayerCard', 'FantasyDeadlineCard'],
    accent: '#4f46e5',
    label: 'C',
  },
  {
    href: '/design-lab/account',
    title: 'Account and Fan Identity',
    description:
      'Polished sign-in, registration, profile and preferences screen. Favourite club selection, province, preferred players, notification settings and non-financial wallet notice.',
    desktopPreview: 'Split-panel auth · Profile settings columns · Fan identity card',
    mobilePreview:  'Tab-based flow · Full-width forms · Club grid selector',
    rationale:
      'Treats fan identity as a first-class concept. Non-financial framing is explicit throughout. Social login placeholders clearly indicate configuration status.',
    components: ['AuthTabs', 'ClubSelector', 'NotificationPrefs', 'FanValueCard'],
    accent: '#e63946',
    label: 'D',
  },
];

export default function DesignLabIndexPage() {
  return (
    <main className="min-h-screen bg-psl-dark text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <p className="text-psl-gold text-xs font-bold uppercase tracking-widest mb-1">PSL One</p>
            <h1 className="text-3xl font-black">Design Lab</h1>
            <p className="text-white/50 text-sm mt-1">
              Interactive frontend demos · Design reference only · Not linked from public navigation
            </p>
          </div>
          <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">
            Back to live site →
          </Link>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-amber-900/30 border-b border-amber-500/30 px-6 py-2">
        <p className="mx-auto max-w-7xl text-xs text-amber-300">
          Design Lab is enabled. These demos use real API data from the beta environment.
          All gameplay is points-only — no real money, no bets, no stakes.
          Do not share these URLs publicly.
        </p>
      </div>

      {/* Demo cards */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {DEMOS.map(demo => (
            <div
              key={demo.href}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
            >
              {/* Preview bar */}
              <div
                className="h-32 flex items-center justify-center relative"
                style={{ backgroundColor: `${demo.accent}33` }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
                  style={{ backgroundColor: demo.accent }}
                >
                  {demo.label}
                </div>
                <div className="absolute top-3 right-3 text-xs text-white/40 font-mono">
                  DEMO {demo.label}
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-lg font-black mb-2">{demo.title}</h2>
                <p className="text-sm text-white/60 leading-relaxed mb-4">{demo.description}</p>

                {/* Preview details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Desktop</div>
                    <p className="text-xs text-white/70 leading-relaxed">{demo.desktopPreview}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Mobile</div>
                    <p className="text-xs text-white/70 leading-relaxed">{demo.mobilePreview}</p>
                  </div>
                </div>

                {/* Rationale */}
                <div className="mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Rationale</div>
                  <p className="text-xs text-white/60 leading-relaxed">{demo.rationale}</p>
                </div>

                {/* Components */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {demo.components.map(c => (
                    <span key={c} className="bg-white/10 text-white/60 text-[10px] font-mono px-2 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                </div>

                <Link
                  href={demo.href}
                  className="block text-center rounded-lg py-2.5 text-sm font-bold transition-colors text-psl-dark"
                  style={{ backgroundColor: demo.accent }}
                >
                  Open Demo {demo.label}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-white/30">
            PSL One Design Lab · Internal reference only · Data from beta API · Not for public distribution
          </p>
          <p className="text-xs text-white/20 mt-1">
            Set <code className="font-mono">NEXT_PUBLIC_DESIGN_LAB_ENABLED=false</code> to disable this area.
          </p>
        </div>
      </div>
    </main>
  );
}
