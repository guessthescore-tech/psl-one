'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { footballClient, type Fixture, type Season, type Team } from '@/lib/football-client';
import { listPublicMedia } from '@/lib/media-client';
import { listPublicCampaigns } from '@/lib/campaigns-client';
import { getBetaToken } from '@/lib/auth-client';
import { getWebRuntimeMetadata } from '@/lib/runtime-metadata';
import { TeamCrest, getCountryFlag } from '@/components/ui/TeamCrest';
import { MediaThumbnail } from '@/components/ui/MediaThumbnail';
import { CompetitionHero } from '@/components/ui/CompetitionHero';

interface MediaAsset {
  id: string;
  title: string;
  slug: string;
  mediaType: string;
  description: string | null;
}

interface Campaign {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

/* ── Fixture card ───────────────────────────────────────────────── */
function FixtureCard({ fixture }: { fixture: Fixture }) {
  const isLive     = fixture.status === 'LIVE' || fixture.status === 'HALF_TIME';
  const isFinished = fixture.status === 'FINISHED';
  const homeFlag   = getCountryFlag(fixture.homeTeam.shortName);
  const awayFlag   = getCountryFlag(fixture.awayTeam.shortName);

  return (
    <Link
      href={`/matches/${fixture.id}`}
      className={`block rounded-card border bg-white p-4 motion-safe:transition-all motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-card-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1 ${
        isLive ? 'border-psl-live/30 shadow-card' : 'border-[#e8eaf0] shadow-card'
      }`}
    >
      {/* Status row */}
      <div className="flex items-center justify-between mb-3 min-h-[18px]">
        {isLive ? (
          <span className="inline-flex items-center gap-1 bg-psl-live text-white text-[9px] font-black px-2 py-0.5 rounded-pill uppercase tracking-wide">
            <span className="w-1 h-1 rounded-full bg-white motion-safe:animate-live-pulse" aria-hidden />
            Live
          </span>
        ) : isFinished ? (
          <span className="text-[10px] font-bold text-psl-muted">FT</span>
        ) : (
          <span className="text-[10px] text-psl-muted">
            {new Date(fixture.kickoffAt).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        {fixture.group && (
          <span className="text-[10px] text-psl-muted truncate ml-2">{fixture.group.name}</span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xl leading-none" aria-hidden>{homeFlag || fixture.homeTeam.shortName.slice(0,2)}</span>
          <span className="text-xs font-bold text-psl-navy truncate w-full text-center">{fixture.homeTeam.shortName}</span>
        </div>
        <div className="flex-shrink-0 text-center px-2">
          {fixture.homeScore !== null && fixture.awayScore !== null ? (
            <div className={`text-xl font-black tabular-nums ${isLive ? 'text-psl-live' : 'text-psl-navy'}`}>
              {fixture.homeScore}–{fixture.awayScore}
            </div>
          ) : (
            <div className="text-xs font-bold text-psl-muted">vs</div>
          )}
        </div>
        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xl leading-none" aria-hidden>{awayFlag || fixture.awayTeam.shortName.slice(0,2)}</span>
          <span className="text-xs font-bold text-psl-navy truncate w-full text-center">{fixture.awayTeam.shortName}</span>
        </div>
      </div>

      {/* Venue */}
      {fixture.venue && (
        <p className="text-[10px] text-psl-muted text-center mt-2 truncate">{fixture.venue.name}</p>
      )}
    </Link>
  );
}

/* ── Fixture skeleton ───────────────────────────────────────────── */
function FixtureSkeleton() {
  return (
    <div className="rounded-card border border-[#e8eaf0] bg-white p-4 space-y-3">
      <div className="h-3 bg-gray-100 rounded-full w-24 motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
      <div className="flex justify-between items-center">
        <div className="h-8 w-8 rounded-full bg-gray-100 motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
        <div className="h-5 w-12 bg-gray-100 rounded motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
        <div className="h-8 w-8 rounded-full bg-gray-100 motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
      </div>
    </div>
  );
}

/* ── Feature cards (Play & Compete) ─────────────────────────────── */
const FEATURE_CARDS = [
  {
    href: '/fantasy',
    title: 'Fantasy Football',
    description: 'Pick your 15-player World Cup squad and score FPL-style points each gameweek.',
    accent: '#00843d',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
      </svg>
    ),
  },
  {
    href: '/predictions',
    title: 'Predict',
    description: 'Call match scores before kick-off and climb the predictions leaderboard.',
    accent: '#1b3a6b',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    href: '/social-challenges',
    title: 'Challenges',
    description: 'Challenge another fan to a points-based prediction duel on any open listing.',
    accent: '#d97706',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
  },
  {
    href: '/leaderboards',
    title: 'Leaderboards',
    description: 'See where you rank across fantasy, predictions, fan value, and achievements.',
    accent: '#e63946',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
];

const FAN_JOURNEY = [
  { href: '/fan-value',   title: 'Fan Value',       description: 'Your non-financial engagement score across all platform activity.' },
  { href: '/achievements', title: 'Achievements',   description: 'Badges earned through fantasy, predictions, and platform milestones.' },
  { href: '/rewards',      title: 'Reward Readiness', description: 'Check your eligibility for future reward opportunities.' },
];

/* ── Page ───────────────────────────────────────────────────────── */
export default function HomePage() {
  const [season,    setSeason]    = useState<Season | null>(null);
  const [fixtures,  setFixtures]  = useState<Fixture[]>([]);
  const [teams,     setTeams]     = useState<Team[]>([]);
  const [media,     setMedia]     = useState<MediaAsset[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading,   setLoading]   = useState(true);
  const meta = getWebRuntimeMetadata();

  useEffect(() => {
    const token = getBetaToken();

    footballClient
      .getActiveSeason()
      .then(s => {
        setSeason(s);
        footballClient.listFixtures({ seasonSlug: s.slug }).then(f => setFixtures(f.slice(0, 9))).catch(() => {});
        footballClient.listTeams({ seasonSlug: s.slug }).then(t => setTeams(t.slice(0, 16))).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    listPublicMedia()
      .then((d: unknown) => {
        const arr = Array.isArray(d) ? (d as MediaAsset[]) : ((d as { assets?: MediaAsset[] }).assets ?? []);
        setMedia(arr.slice(0, 4));
      })
      .catch(() => {});

    if (token) {
      listPublicCampaigns(token)
        .then((d: unknown) => {
          const arr = Array.isArray(d) ? (d as Campaign[]) : ((d as { campaigns?: Campaign[] }).campaigns ?? []);
          setCampaigns(arr.slice(0, 2));
        })
        .catch(() => {});
    }
  }, []);

  const liveFixtures = fixtures.filter(f => f.status === 'LIVE' || f.status === 'HALF_TIME');
  const hasLive = liveFixtures.length > 0;

  return (
    <main>

      {/* ── Competition context hero ──────────────────────────────── */}
      <CompetitionHero season={season} loading={loading} />

      {/* ── Live strip ───────────────────────────────────────────── */}
      {hasLive && (
        <div className="bg-psl-live/10 border-b border-psl-live/20 py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto">
            <span className="inline-flex items-center gap-1 text-psl-live text-xs font-bold uppercase tracking-wide flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-psl-live motion-safe:animate-live-pulse" aria-hidden />
              Live
            </span>
            {liveFixtures.map(f => (
              <Link
                key={f.id}
                href={`/matches/${f.id}`}
                className="text-xs font-bold text-psl-live whitespace-nowrap hover:underline flex-shrink-0 focus-visible:outline-none focus-visible:underline"
              >
                {getCountryFlag(f.homeTeam.shortName) || f.homeTeam.shortName}&nbsp;
                {f.homeScore}–{f.awayScore}&nbsp;
                {getCountryFlag(f.awayTeam.shortName) || f.awayTeam.shortName}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-psl-midnight text-white py-16 sm:py-24 px-4"
        aria-label="Platform hero"
      >
        {/* Pitch texture overlay */}
        <div className="absolute inset-0 bg-pitch-dark opacity-10 pointer-events-none" aria-hidden />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-psl-midnight/95 via-psl-navy/70 to-psl-green/20 pointer-events-none" aria-hidden />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-psl-gold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-psl-gold opacity-75" aria-hidden />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-psl-gold" aria-hidden />
            </span>
            FIFA World Cup 2026 — Beta Season
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-display-xl font-black tracking-tight leading-tight">
            The Digital Home of<br className="hidden sm:block" />
            <span className="text-psl-gold"> South African Football</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-white/65 max-w-xl leading-relaxed">
            Fantasy football, score predictions, social challenges, live match intelligence
            and fan rewards — all in one platform.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/fantasy"
              className="rounded-card-sm bg-psl-gold px-8 py-3.5 text-sm font-black text-psl-midnight hover:bg-yellow-300 motion-safe:transition-colors shadow-glow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-psl-midnight text-center"
            >
              Play Fantasy Football
            </Link>
            <Link
              href="/predictions"
              className="rounded-card-sm border border-white/25 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-psl-midnight text-center"
            >
              Make a Prediction
            </Link>
          </div>

          <p className="mt-6 text-xs text-white/35">
            Beta platform · Points only · No real money · No deposits · No withdrawals
          </p>
        </div>
      </section>

      {/* ── Fixtures ─────────────────────────────────────────────── */}
      <section className="py-10 sm:py-12 px-4 bg-psl-surface" aria-label="Upcoming fixtures">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-display-sm text-psl-navy">Upcoming Fixtures</h2>
            <Link href="/matches" className="text-xs font-semibold text-psl-muted hover:text-psl-navy motion-safe:transition-colors">
              All matches →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <FixtureSkeleton key={i} />)}
            </div>
          ) : fixtures.length === 0 ? (
            <div className="rounded-card border border-[#e8eaf0] bg-white p-10 text-center">
              <p className="text-sm text-psl-muted">No upcoming fixtures found.</p>
              <Link href="/matches" className="mt-3 inline-block text-xs font-semibold text-psl-navy hover:underline">
                Browse all matches
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fixtures.map(f => <FixtureCard key={f.id} fixture={f} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Play & Compete ───────────────────────────────────────── */}
      <section className="py-10 sm:py-12 px-4 bg-white" aria-label="Platform features">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5">
            <h2 className="text-display-sm text-psl-navy">Play &amp; Compete</h2>
            <p className="text-xs text-psl-muted mt-1">Points only · no real money · no bets · no stakes</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_CARDS.map(card => (
              <Link
                key={card.href}
                href={card.href}
                className="block rounded-card border border-[#e8eaf0] p-5 hover:shadow-card-md motion-safe:hover:-translate-y-0.5 motion-safe:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1"
                style={{ borderTopColor: card.accent, borderTopWidth: 3 }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${card.accent}18`, color: card.accent }}
                  aria-hidden
                >
                  {card.icon}
                </div>
                <div className="font-black text-sm text-psl-navy mb-1">{card.title}</div>
                <div className="text-xs text-psl-muted leading-relaxed">{card.description}</div>
                <div className="mt-3 text-xs font-semibold" style={{ color: card.accent }}>Open →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Teams rail ───────────────────────────────────────────── */}
      {(teams.length > 0 || loading) && (
        <section className="py-10 sm:py-12 px-4 bg-psl-surface" aria-label="Teams in tournament">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-display-sm text-psl-navy">Teams</h2>
              <Link href="/clubs" className="text-xs font-semibold text-psl-muted hover:text-psl-navy motion-safe:transition-colors">
                All clubs →
              </Link>
            </div>
            {loading ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-16 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
                    <div className="h-2.5 w-10 bg-gray-100 rounded motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex gap-4 overflow-x-auto pb-2"
                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                role="list"
                aria-label="Tournament teams"
              >
                {teams.map(t => (
                  <div
                    key={t.id}
                    role="listitem"
                    className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <TeamCrest
                      name={t.name}
                      shortName={t.shortName}
                      size="md"
                      showFlag
                      className="motion-safe:group-hover:scale-105 motion-safe:transition-transform"
                    />
                    <span className="text-[10px] text-psl-muted font-semibold text-center leading-tight max-w-[52px] truncate">
                      {t.shortName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Latest Media ─────────────────────────────────────────── */}
      {(media.length > 0 || loading) && (
        <section className="py-10 sm:py-12 px-4 bg-white" aria-label="Latest media">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-display-sm text-psl-navy">Latest</h2>
              <Link href="/media" className="text-xs font-semibold text-psl-muted hover:text-psl-navy motion-safe:transition-colors">
                View all →
              </Link>
            </div>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-card overflow-hidden border border-[#e8eaf0]">
                    <div className="h-36 bg-gray-100 motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
                      <div className="h-3 bg-gray-100 rounded w-3/4 motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {media.map(item => (
                  <Link
                    key={item.id}
                    href={`/media/${item.slug}`}
                    className="block rounded-card border border-[#e8eaf0] overflow-hidden hover:shadow-card-md motion-safe:transition-shadow group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1"
                  >
                    <MediaThumbnail
                      title={item.title}
                      mediaType={item.mediaType}
                      className="rounded-none"
                    />
                    <div className="p-3">
                      <h3 className="text-xs font-semibold text-psl-navy group-hover:text-psl-green motion-safe:transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-[11px] text-psl-muted mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Campaigns ────────────────────────────────────────────── */}
      {campaigns.length > 0 && (
        <section className="py-10 sm:py-12 px-4 bg-psl-surface" aria-label="Fan campaigns">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-display-sm text-psl-navy">Fan Campaigns</h2>
              <Link href="/campaigns" className="text-xs font-semibold text-psl-muted hover:text-psl-navy motion-safe:transition-colors">
                All campaigns →
              </Link>
            </div>
            <p className="text-[11px] text-psl-muted mb-5">
              Fan Value points are non-cash loyalty points — not money, betting credits, or a withdrawable balance.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {campaigns.map(c => (
                <Link
                  key={c.id}
                  href={`/campaigns/${c.slug}`}
                  className="block bg-white rounded-card border border-[#e8eaf0] p-5 hover:shadow-card-md motion-safe:transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1"
                >
                  <h3 className="font-bold text-sm text-psl-navy">{c.name}</h3>
                  {c.description && (
                    <p className="text-xs text-psl-muted mt-1 line-clamp-2">{c.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Fan Journey ──────────────────────────────────────────── */}
      <section className="py-10 sm:py-12 px-4 bg-psl-midnight text-white" aria-label="Fan journey">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5">
            <h2 className="text-display-sm text-white">Your Fan Journey</h2>
            <p className="text-xs text-white/50 mt-1">
              Track your points, achievements, and reward readiness — all non-financial.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {FAN_JOURNEY.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="block bg-white/8 hover:bg-white/12 rounded-card p-5 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-psl-midnight border border-white/10"
              >
                <div className="font-black text-sm mb-1">{item.title}</div>
                <div className="text-xs text-white/55 leading-relaxed">{item.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-psl-dark text-white py-10 sm:py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            <div>
              <div className="text-lg font-black mb-3">PSL <span className="text-psl-gold">One</span></div>
              <p className="text-xs text-gray-400 leading-relaxed">
                The digital operating system of South African football. Beta platform — FIFA World Cup 2026.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Play</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/fantasy"          className="hover:text-white motion-safe:transition-colors">Fantasy Football</Link></li>
                <li><Link href="/predictions"      className="hover:text-white motion-safe:transition-colors">Predictions</Link></li>
                <li><Link href="/social-challenges" className="hover:text-white motion-safe:transition-colors">Social Challenges</Link></li>
                <li><Link href="/leaderboards"     className="hover:text-white motion-safe:transition-colors">Leaderboards</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Football</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/matches"          className="hover:text-white motion-safe:transition-colors">Matches</Link></li>
                <li><Link href="/football"         className="hover:text-white motion-safe:transition-colors">Table</Link></li>
                <li><Link href="/clubs"            className="hover:text-white motion-safe:transition-colors">Clubs</Link></li>
                <li><Link href="/players"          className="hover:text-white motion-safe:transition-colors">Players</Link></li>
                <li><Link href="/media"            className="hover:text-white motion-safe:transition-colors">Media</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Account</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/profile"          className="hover:text-white motion-safe:transition-colors">Profile</Link></li>
                <li><Link href="/fan-value"        className="hover:text-white motion-safe:transition-colors">Fan Value</Link></li>
                <li><Link href="/achievements"     className="hover:text-white motion-safe:transition-colors">Achievements</Link></li>
                <li><Link href="/rewards"          className="hover:text-white motion-safe:transition-colors">Rewards</Link></li>
                <li><Link href="/wallet"           className="hover:text-white motion-safe:transition-colors">Wallet (Sandbox)</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 space-y-2">
            <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
              PSL One is in controlled beta. All gameplay uses points only — no real money, no deposits, no withdrawals.
              Fantasy and prediction results affect platform leaderboards only. Fan Value is a non-financial loyalty score.
              This platform is not a betting or gambling product.
              PSL Premiership — Coming Soon.
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
              <span>© 2026 PSL One</span>
              <span>·</span>
              <span className="font-mono text-psl-gold/60">{meta.environment.toUpperCase()}</span>
              <span>·</span>
              <Link href="/beta" className="hover:text-gray-300 motion-safe:transition-colors">Beta Info</Link>
              <span>·</span>
              <Link href="/health" className="hover:text-gray-300 motion-safe:transition-colors">System Health</Link>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
