'use client';

import Link from 'next/link';
import {
  PreviewFrame,
  LeagueMatchdayPreview,
  PredictPreview,
  FantasyPreview,
  AccountPreview,
} from '@/components/design-lab/PreviewFrame';

/* ── Design system token display ───────────────────────────────── */
const TOKENS = [
  { name: 'Navy', hex: '#1b3a6b',  bg: 'bg-[#1b3a6b]' },
  { name: 'Midnight', hex: '#0d1b2e', bg: 'bg-[#0d1b2e]' },
  { name: 'Gold', hex: '#ffd700',  bg: 'bg-[#ffd700]' },
  { name: 'Green', hex: '#00843d', bg: 'bg-[#00843d]' },
  { name: 'Red', hex: '#ef4444',   bg: 'bg-[#ef4444]' },
  { name: 'Surface', hex: '#f5f7fb', bg: 'bg-[#f5f7fb] border border-gray-200' },
];

/* ── Demo definitions ─────────────────────────────────────────── */
interface Demo {
  id: string;
  href: string;
  productName: string;
  letter: string;
  tagline: string;
  purpose: string;
  keyPrinciple: string;
  primaryInteraction: string;
  maturity: 'Beta' | 'Alpha';
  previewComponent: React.ReactNode;
  accent: string;
  accentText: string;
}

const DEMOS: Demo[] = [
  {
    id: 'league-matchday',
    href: '/design-lab/in-season-home',
    productName: 'League Matchday',
    letter: 'A',
    tagline: 'The active league platform',
    purpose: 'Serves the fan who opens the app during matchday and needs to instantly know — what is happening right now, what does the table look like, and where does my team stand.',
    keyPrinciple: 'Current football activity first. Marketing second.',
    primaryInteraction: 'Fixture rail · Table snapshot · Predictions',
    maturity: 'Beta',
    previewComponent: <LeagueMatchdayPreview />,
    accent: '#1b3a6b',
    accentText: 'text-white',
  },
  {
    id: 'predict',
    href: '/design-lab/prediction-carousel',
    productName: 'Predict',
    letter: 'B',
    tagline: 'Sofascore-grade fixture prediction',
    purpose: 'Lets fans sweep through upcoming fixtures and lock in score predictions with one thumb. Points-only — no odds, no wagers.',
    keyPrinciple: 'One prediction per swipe. Zero friction.',
    primaryInteraction: 'Swipe · Tap outcome · Confirm',
    maturity: 'Beta',
    previewComponent: <PredictPreview />,
    accent: '#00843d',
    accentText: 'text-white',
  },
  {
    id: 'fantasy-command-centre',
    href: '/design-lab/fantasy-hub',
    productName: 'Fantasy Command Centre',
    letter: 'C',
    tagline: 'FPL-density, PSL identity',
    purpose: 'An immersive fantasy dashboard where managers can review their squad on the pitch, track points, manage transfers, and follow their mini-league — all from one screen.',
    keyPrinciple: 'Deep data without overwhelm. Pitch-first.',
    primaryInteraction: 'Pitch · Tabs · Transfers',
    maturity: 'Beta',
    previewComponent: <FantasyPreview />,
    accent: '#312e81',
    accentText: 'text-white',
  },
  {
    id: 'my-psl-one',
    href: '/design-lab/account',
    productName: 'My PSL One',
    letter: 'D',
    tagline: 'Fan identity, first-class',
    purpose: 'Treats the fan\'s identity as a product — not a settings panel. Club, province, favourite players, Fan Value, notification preferences and wallet — in a single polished experience.',
    keyPrinciple: 'Identity before settings.',
    primaryInteraction: 'Join · Club select · Profile',
    maturity: 'Alpha',
    previewComponent: <AccountPreview />,
    accent: '#c9a800',
    accentText: 'text-psl-midnight',
  },
];

/* ── Maturity badge ─────────────────────────────────────────────── */
function MaturityBadge({ maturity }: { maturity: Demo['maturity'] }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-[11px] font-bold tracking-wide ${
      maturity === 'Beta'
        ? 'bg-psl-green/15 text-psl-green'
        : 'bg-amber-100 text-amber-700'
    }`}>
      {maturity}
    </span>
  );
}

/* ── Demo card ──────────────────────────────────────────────────── */
function DemoCard({ demo }: { demo: Demo }) {
  return (
    <article className="group bg-white rounded-card border border-[#e8eaf0] hover:border-[#c0c6d8] hover:shadow-card-lg motion-safe:transition-all motion-safe:duration-200 overflow-hidden flex flex-col">
      {/* Preview */}
      <div className="relative">
        <PreviewFrame frameBg="bg-[#f0f2f8]" className="rounded-none border-0">
          {demo.previewComponent}
        </PreviewFrame>
        {/* Letter reference — small, secondary */}
        <div
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black opacity-60"
          style={{ backgroundColor: demo.accent, color: demo.accentText === 'text-white' ? '#fff' : '#0d1b2e' }}
        >
          {demo.letter}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-display-sm text-psl-navy leading-tight">{demo.productName}</h2>
            <p className="text-body-sm text-psl-muted mt-0.5">{demo.tagline}</p>
          </div>
          <MaturityBadge maturity={demo.maturity} />
        </div>

        {/* Purpose */}
        <p className="text-body-sm text-gray-600 leading-relaxed mb-4">{demo.purpose}</p>

        {/* Key principle */}
        <div className="mb-4 pl-3 border-l-2 border-[#e8eaf0] group-hover:border-psl-navy motion-safe:transition-colors motion-safe:duration-200">
          <p className="text-label-md text-psl-muted mb-0.5">Key UX Principle</p>
          <p className="text-body-sm font-semibold text-psl-navy">{demo.keyPrinciple}</p>
        </div>

        {/* Interaction */}
        <div className="mb-5">
          <p className="text-label-md text-psl-muted mb-1">Primary interaction</p>
          <div className="flex flex-wrap gap-1.5">
            {demo.primaryInteraction.split(' · ').map(tag => (
              <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-pill bg-[#f0f2f8] text-psl-navy text-[11px] font-semibold">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <Link
            href={demo.href}
            className="flex items-center justify-between w-full px-4 py-3 rounded-card-sm text-sm font-bold motion-safe:transition-all motion-safe:duration-150 motion-safe:hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-2"
            style={{ backgroundColor: demo.accent, color: demo.accentText === 'text-white' ? '#fff' : '#0d1b2e' }}
            aria-label={`Open ${demo.productName} prototype`}
          >
            <span>Open prototype</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ── Design system row ──────────────────────────────────────────── */
function DesignSystemSummary() {
  return (
    <section aria-label="Design system summary" className="mt-16 pt-12 border-t border-[#e8eaf0]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-label-md text-psl-muted mb-1">Design System</p>
            <h2 className="text-display-sm text-psl-navy">PSL One Visual Language</h2>
          </div>
          <p className="text-body-sm text-psl-muted max-w-sm">
            Navy + Gold primary palette. Inter typeface. Sports-broadcast density. Mobile-first layout.
          </p>
        </div>

        {/* Colour tokens */}
        <div className="mb-8">
          <p className="text-label-sm text-psl-muted mb-3">Colour</p>
          <div className="flex flex-wrap gap-3">
            {TOKENS.map(t => (
              <div key={t.name} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg shadow-card ${t.bg}`} />
                <div>
                  <div className="text-[11px] font-semibold text-psl-navy leading-none">{t.name}</div>
                  <div className="text-[10px] font-mono text-psl-muted">{t.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Type scale */}
        <div className="mb-8">
          <p className="text-label-sm text-psl-muted mb-3">Typography</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: 'Display', example: 'Match Score', cls: 'text-[2.25rem] font-black leading-none tracking-tight text-psl-navy tabular-nums' },
              { role: 'Headline', example: 'League Matchday', cls: 'text-xl font-black leading-tight tracking-tight text-psl-navy' },
              { role: 'Body', example: 'Fan engagement platform', cls: 'text-sm font-normal leading-relaxed text-gray-600' },
              { role: 'Label', example: 'MATCHDAY 3', cls: 'text-[11px] font-bold tracking-widest uppercase text-psl-muted' },
            ].map(t => (
              <div key={t.role} className="bg-[#f5f7fb] rounded-card-sm p-4">
                <p className="text-label-sm text-psl-muted mb-2">{t.role}</p>
                <p className={t.cls}>{t.example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Direction note */}
        <div className="bg-psl-midnight rounded-card p-6 text-white">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-card-sm bg-psl-gold flex-shrink-0 flex items-center justify-center">
              <svg className="w-5 h-5 text-psl-midnight" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-base mb-1">Recommended Product Direction</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Ship <strong className="text-white">League Matchday</strong> and <strong className="text-white">Predict</strong> for the beta launch window.
                Introduce <strong className="text-white">Fantasy Command Centre</strong> once the WC group stage is underway.
                Position <strong className="text-white">My PSL One</strong> as the registration experience — prioritise club selection and fan value visibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function DesignLabIndexPage() {
  return (
    <main className="min-h-screen bg-psl-surface">
      {/* Hero */}
      <div className="bg-psl-midnight text-white">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-10">
          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm motion-safe:transition-colors mb-8">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to live site
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              {/* Beta badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-pill px-3 py-1.5 mb-5">
                <span className="w-2 h-2 rounded-full bg-psl-gold animate-live-pulse" />
                <span className="text-label-sm text-psl-gold tracking-wider">Beta Only · Internal Review</span>
              </div>

              <p className="text-label-md text-white/40 mb-2">PSL One</p>
              <h1 className="text-display-xl text-white leading-none mb-3">
                Design Lab
              </h1>
              <p className="text-body-lg text-white/60 max-w-xl leading-relaxed">
                Four production-quality interactive prototypes for executive, sponsor and product direction review.
                Real API data. Points-only gameplay. Not linked from public navigation.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex gap-6 shrink-0">
              {[
                { n: '4', label: 'Prototypes' },
                { n: '342', label: 'Total routes' },
                { n: '1,652', label: 'API tests' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-stat-lg text-psl-gold">{s.n}</div>
                  <div className="text-label-sm text-white/40">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Amber notice bar */}
        <div className="border-t border-white/10 bg-amber-950/60">
          <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-xs text-amber-300">
              Beta environment · real API data · points-only gameplay · no real money · no bets · no stakes ·
              do not share these URLs publicly
            </p>
          </div>
        </div>
      </div>

      {/* Demo cards grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-label-md text-psl-muted mb-1">Prototypes</p>
            <h2 className="text-display-md text-psl-navy">Four design directions</h2>
          </div>
          <p className="text-body-sm text-psl-muted hidden md:block">
            Each prototype uses real API data and represents a distinct fan interaction context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEMOS.map(demo => (
            <DemoCard key={demo.id} demo={demo} />
          ))}
        </div>
      </div>

      {/* Design system summary */}
      <DesignSystemSummary />

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 mt-12 border-t border-[#e8eaf0]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-psl-muted">
            PSL One Design Lab · Internal reference only · Not for public distribution
          </p>
          <p className="text-[11px] text-psl-muted">
            Disable: <code className="font-mono bg-[#f0f2f8] px-1 py-0.5 rounded text-[10px]">NEXT_PUBLIC_DESIGN_LAB_ENABLED=false</code>
          </p>
        </div>
      </footer>
    </main>
  );
}
