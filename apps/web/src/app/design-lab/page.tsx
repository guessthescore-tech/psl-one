'use client';

import Link from 'next/link';
import {
  PreviewFrame,
  LeagueMatchdayPreview,
  PredictPreview,
  FantasyPreview,
  AccountPreview,
} from '@/components/design-lab/PreviewFrame';

/* ── Colour palette ─────────────────────────────────────────────── */
const TOKENS = [
  { name: 'Navy',     hex: '#1b3a6b', cls: 'bg-[#1b3a6b]' },
  { name: 'Midnight', hex: '#0d1b2e', cls: 'bg-[#0d1b2e]' },
  { name: 'Gold',     hex: '#ffd700', cls: 'bg-[#ffd700]' },
  { name: 'Green',    hex: '#00843d', cls: 'bg-[#00843d]' },
  { name: 'Live red', hex: '#ef4444', cls: 'bg-[#ef4444]' },
  { name: 'Surface',  hex: '#f5f7fb', cls: 'bg-[#f5f7fb] border border-[#e8eaf0]' },
];

/* ── Product definitions ────────────────────────────────────────── */
interface Product {
  href: string;
  name: string;
  tagline: string;
  summary: string;
  maturity: 'Beta' | 'Alpha';
  preview: React.ReactNode;
  accent: string;        // hex
  accentDark: boolean;   // true → white text on accent
}

const PRODUCTS: Product[] = [
  {
    href: '/design-lab/in-season-home',
    name: 'League Matchday',
    tagline: 'The active match platform',
    summary: 'Live fixtures, real-time standings, fan value and predictions in one cohesive matchday view. Hierarchy starts with what is happening right now.',
    maturity: 'Beta',
    preview: <LeagueMatchdayPreview />,
    accent: '#1b3a6b',
    accentDark: true,
  },
  {
    href: '/design-lab/prediction-carousel',
    name: 'Predict',
    tagline: 'One prediction per swipe',
    summary: 'Fans sweep through upcoming fixtures and lock in score predictions with one thumb. Points-only — no odds, no wagers, zero friction.',
    maturity: 'Beta',
    preview: <PredictPreview />,
    accent: '#00843d',
    accentDark: true,
  },
  {
    href: '/design-lab/fantasy-hub',
    name: 'Fantasy Command Centre',
    tagline: 'Pitch-first squad management',
    summary: 'An immersive fantasy dashboard where managers review their squad on the pitch, track gameweek points, make transfers and follow their mini-league.',
    maturity: 'Beta',
    preview: <FantasyPreview />,
    accent: '#312e81',
    accentDark: true,
  },
  {
    href: '/design-lab/account',
    name: 'My PSL One',
    tagline: 'Fan identity, first-class',
    summary: 'Treats the fan\'s identity as a product — not a settings panel. Club, Fan Value, notifications and profile in a single polished experience.',
    maturity: 'Alpha',
    preview: <AccountPreview />,
    accent: '#ffd700',
    accentDark: false,
  },
];

/* ── Maturity badge ─────────────────────────────────────────────── */
function MaturityBadge({ maturity }: { maturity: Product['maturity'] }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-[10px] font-bold tracking-wide ${
      maturity === 'Beta' ? 'bg-psl-green/15 text-psl-green' : 'bg-amber-100 text-amber-700'
    }`}>
      {maturity}
    </span>
  );
}

/* ── Arrow icon ─────────────────────────────────────────────────── */
function Arrow({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

/* ── Hero product card (League Matchday — full-width feature) ───── */
function HeroCard({ product }: { product: Product }) {
  return (
    <article className="group rounded-card overflow-hidden shadow-card-lg bg-psl-midnight text-white lg:grid lg:grid-cols-5 motion-safe:transition-shadow motion-safe:hover:shadow-card-xl">
      {/* Content — 2 cols on desktop */}
      <div className="p-8 lg:p-10 lg:col-span-2 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <MaturityBadge maturity={product.maturity} />
          </div>
          <h2 className="text-display-md text-white leading-tight mb-2">{product.name}</h2>
          <p className="text-body-md text-white/50 mb-5">{product.tagline}</p>
          <p className="text-body-sm text-white/60 leading-relaxed">{product.summary}</p>
        </div>
        <div className="mt-8">
          <Link
            href={product.href}
            className="inline-flex items-center gap-3 bg-psl-gold text-psl-midnight font-black text-sm px-6 py-3 rounded-card-sm hover:bg-yellow-300 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-psl-midnight"
            aria-label={`Open ${product.name}`}
          >
            Open
            <Arrow className="w-4 h-4" />
          </Link>
        </div>
      </div>
      {/* Preview — 3 cols on desktop, bg fills full column height */}
      <div className="lg:col-span-3 bg-[#0a1524] border-t border-white/5 lg:border-t-0 lg:border-l lg:border-white/5 overflow-hidden">
        <PreviewFrame frameBg="bg-[#0a1524]" variant="desktop" className="rounded-none border-0 shadow-none">
          {product.preview}
        </PreviewFrame>
      </div>
    </article>
  );
}

/* ── Compact product card ───────────────────────────────────────── */
function CompactCard({ product }: { product: Product }) {
  const ctaColor = product.accentDark ? '#fff' : '#0d1b2e';
  return (
    <article className="group bg-white rounded-card border border-[#e8eaf0] overflow-hidden flex flex-col motion-safe:transition-all motion-safe:duration-200 hover:border-[#c0c8d8] hover:shadow-card-md">
      {/* Preview */}
      <PreviewFrame frameBg="bg-[#f0f2f8]" className="rounded-none border-0">
        {product.preview}
      </PreviewFrame>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-sm font-black text-psl-navy leading-tight">{product.name}</h2>
          <MaturityBadge maturity={product.maturity} />
        </div>
        <p className="text-xs text-psl-muted mb-1 font-semibold">{product.tagline}</p>
        <p className="text-xs text-gray-500 leading-relaxed mb-5 flex-1">
          {product.summary.split('.')[0]}.
        </p>
        <Link
          href={product.href}
          className="flex items-center justify-between text-sm font-bold px-4 py-2.5 rounded-card-sm motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ backgroundColor: product.accent, color: ctaColor }}
          aria-label={`Open ${product.name}`}
        >
          Open
          <Arrow className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

/* ── Product direction card ─────────────────────────────────────── */
function DirectionCard() {
  return (
    <div className="bg-psl-midnight rounded-card p-6 text-white flex gap-5 items-start">
      <div className="w-10 h-10 rounded-card-sm bg-psl-gold flex-shrink-0 flex items-center justify-center">
        <svg className="w-5 h-5 text-psl-midnight" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      </div>
      <div>
        <h3 className="font-black text-sm mb-2">Recommended Product Direction</h3>
        <p className="text-xs text-white/60 leading-relaxed">
          Ship <strong className="text-white">League Matchday</strong> and <strong className="text-white">Predict</strong> for the beta launch window.
          Introduce <strong className="text-white">Fantasy Command Centre</strong> once the WC group stage is underway.
          Position <strong className="text-white">My PSL One</strong> as the fan registration experience — prioritise club selection and Fan Value visibility.
        </p>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function DesignLabIndexPage() {
  const hero = PRODUCTS[0]!;
  const secondary = PRODUCTS.slice(1);

  return (
    <main className="min-h-screen bg-psl-surface">

      {/* ── Brand header ────────────────────────────────────────── */}
      <header className="bg-psl-midnight text-white">
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs motion-safe:transition-colors mb-8 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Live site
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 rounded-pill px-3 py-1 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-psl-gold motion-safe:animate-live-pulse" aria-hidden />
                <span className="text-[10px] font-bold tracking-widest text-psl-gold uppercase">Beta Only · Internal Review</span>
              </div>
              <p className="text-label-md text-white/30 mb-1">PSL One</p>
              <h1 className="text-display-xl text-white leading-none">Design Lab</h1>
            </div>
            <p className="text-body-sm text-white/50 max-w-xs leading-relaxed md:text-right">
              Four production-quality interactive prototypes. Real API data. Points-only gameplay.
            </p>
          </div>
        </div>

        {/* Notice bar */}
        <div className="border-t border-white/8 bg-amber-950/50">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-[11px] text-amber-300/80">
              points-only gameplay · no real money · no bets · no stakes · do not share these URLs publicly
            </p>
          </div>
        </div>
      </header>

      {/* ── Products ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
        {/* Hero — League Matchday */}
        <HeroCard product={hero} />

        {/* Secondary grid — Predict · Fantasy · My PSL One */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {secondary.map(p => (
            <CompactCard key={p.href} product={p} />
          ))}
        </div>
      </div>

      {/* ── Design system ───────────────────────────────────────── */}
      <section aria-label="Design system" className="max-w-7xl mx-auto px-6 pb-12">
        <div className="border-t border-[#e8eaf0] pt-10">
          <p className="text-label-md text-psl-muted mb-6">Visual Language</p>

          {/* Colour */}
          <div className="flex flex-wrap gap-4 mb-8">
            {TOKENS.map(t => (
              <div key={t.name} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg shadow-card ${t.cls} flex-shrink-0`} aria-hidden />
                <div>
                  <div className="text-[11px] font-semibold text-psl-navy leading-none">{t.name}</div>
                  <div className="text-[10px] font-mono text-psl-muted">{t.hex}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Direction */}
          <DirectionCard />
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="max-w-7xl mx-auto px-6 py-6 border-t border-[#e8eaf0]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
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
