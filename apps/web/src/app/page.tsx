'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { footballClient, type Fixture, type Season, type Team } from '@/lib/football-client';
import { listPublicMedia } from '@/lib/media-client';
import { listPublicCampaigns } from '@/lib/campaigns-client';
import { getBetaToken } from '@/lib/auth-client';
import { getWebRuntimeMetadata } from '@/lib/runtime-metadata';

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

const FEATURE_CARDS = [
  {
    href: '/fantasy',
    title: 'Fantasy Football',
    description: 'Pick your 15-player World Cup squad and score FPL-style points each gameweek.',
    accent: '#00843d',
    label: 'FF',
  },
  {
    href: '/predictions',
    title: 'Guess the Score',
    description: 'Predict match results before kick-off and climb the predictions leaderboard.',
    accent: '#1b3a6b',
    label: 'GS',
  },
  {
    href: '/social-challenges',
    title: 'Social Challenges',
    description: 'Challenge another fan to a points-based prediction duel on any open listing.',
    accent: '#e6a800',
    label: 'SC',
  },
  {
    href: '/leaderboards',
    title: 'Leaderboards',
    description: 'See where you rank across fantasy, predictions, fan value, and achievements.',
    accent: '#e63946',
    label: 'LB',
  },
];

const FAN_JOURNEY = [
  {
    href: '/fan-value',
    title: 'Fan Value',
    description: 'Your non-financial engagement score across all platform activity.',
  },
  {
    href: '/achievements',
    title: 'Achievements',
    description: 'Badges earned through fantasy, predictions, and platform milestones.',
  },
  {
    href: '/rewards',
    title: 'Reward Readiness',
    description: 'Check your eligibility for future reward opportunities.',
  },
];

function fixtureStatusBadge(status: Fixture['status']): { label: string; cls: string } {
  if (status === 'LIVE') return { label: 'LIVE', cls: 'bg-psl-green text-white' };
  if (status === 'HALF_TIME') return { label: 'HT', cls: 'bg-psl-gold text-psl-navy' };
  if (status === 'FINISHED') return { label: 'FT', cls: 'bg-gray-200 text-gray-600' };
  if (status === 'POSTPONED') return { label: 'PPD', cls: 'bg-red-100 text-red-600' };
  return { label: 'UPCOMING', cls: 'bg-gray-100 text-gray-500' };
}

export default function HomePage() {
  const [season, setSeason] = useState<Season | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const meta = getWebRuntimeMetadata();

  useEffect(() => {
    const token = getBetaToken();

    footballClient
      .getActiveSeason()
      .then((s) => {
        setSeason(s);
        footballClient
          .listFixtures({ seasonSlug: s.slug })
          .then((f) => setFixtures(f.slice(0, 6)))
          .catch(() => {});
        footballClient
          .listTeams({ seasonSlug: s.slug })
          .then((t) => setTeams(t.slice(0, 8)))
          .catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    listPublicMedia()
      .then((d: unknown) => {
        const arr = Array.isArray(d)
          ? (d as MediaAsset[])
          : ((d as { assets?: MediaAsset[] }).assets ?? []);
        setMedia(arr.slice(0, 3));
      })
      .catch(() => {});

    if (token) {
      listPublicCampaigns(token)
        .then((d: unknown) => {
          const arr = Array.isArray(d)
            ? (d as Campaign[])
            : ((d as { campaigns?: Campaign[] }).campaigns ?? []);
          setCampaigns(arr.slice(0, 2));
        })
        .catch(() => {});
    }
  }, []);

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-psl-navy shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-black text-white tracking-tight">
              PSL <span className="text-psl-gold">One</span>
            </Link>
            <nav
              className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80"
              aria-label="Main navigation"
            >
              <Link href="/matches" className="hover:text-white transition-colors">Matches</Link>
              <Link href="/fantasy" className="hover:text-white transition-colors">Fantasy</Link>
              <Link href="/predictions" className="hover:text-white transition-colors">Predictions</Link>
              <Link href="/leaderboards" className="hover:text-white transition-colors">Leaderboards</Link>
              <Link href="/clubs" className="hover:text-white transition-colors">Clubs</Link>
              <Link href="/media" className="hover:text-white transition-colors">Media</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:block text-sm text-white/70 hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-psl-gold px-4 py-2 text-sm font-bold text-psl-navy hover:bg-yellow-400 transition-colors"
              >
                Join Beta
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-20 md:pb-0">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-psl-navy via-[#163060] to-psl-green py-20 px-4 text-white">
          <div className="mx-auto max-w-4xl text-center relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-psl-gold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-psl-gold opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-psl-gold" />
              </span>
              FIFA World Cup 2026 — Beta Season
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              The Digital Home of
              <br className="hidden sm:block" />
              <span className="text-psl-gold"> South African Football</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/70 max-w-xl mx-auto">
              Fantasy football, score predictions, social challenges, live match intelligence
              and fan rewards — all in one platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/fantasy"
                className="rounded-lg bg-psl-gold px-8 py-3.5 text-base font-bold text-psl-navy hover:bg-yellow-400 transition-colors shadow-lg"
              >
                Play Fantasy Football
              </Link>
              <Link
                href="/predictions"
                className="rounded-lg border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Make a Prediction
              </Link>
            </div>
            <p className="mt-6 text-xs text-white/40">
              Beta platform · Points only · No real money · No deposits · No withdrawals
            </p>
          </div>
        </section>

        {/* ── Season Banner ────────────────────────────────────────────── */}
        <div className="bg-psl-green py-2 px-4 text-center text-xs sm:text-sm font-medium text-white">
          {season ? (
            <>
              Active Season: <strong>{season.name}</strong>
              {' · '}PSL Premiership — Coming Soon
              {' · '}Fan Value points are non-financial
            </>
          ) : (
            <>FIFA World Cup 2026 — Beta Season · Fan Value points are non-financial</>
          )}
        </div>

        {/* ── Upcoming Fixtures ─────────────────────────────────────────── */}
        <section className="py-12 px-4 bg-gray-50" aria-label="Upcoming fixtures">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-psl-navy">Upcoming Fixtures</h2>
              <Link
                href="/matches"
                className="text-sm font-medium text-psl-navy/60 hover:text-psl-navy transition-colors"
              >
                View all matches →
              </Link>
            </div>

            {loading && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {!loading && fixtures.length === 0 && (
              <div className="text-center py-10 text-sm text-gray-400">
                No upcoming fixtures found.{' '}
                <Link href="/matches" className="text-psl-navy underline">
                  Browse all matches
                </Link>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fixtures.map((f) => {
                const badge = fixtureStatusBadge(f.status);
                return (
                  <Link
                    key={f.id}
                    href={`/matches/${f.id}`}
                    className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-psl-navy/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                      {f.group && (
                        <span className="text-xs text-gray-400">{f.group.name}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-psl-navy truncate flex-1">
                        {f.homeTeam.shortName}
                      </span>
                      <span className="text-lg font-black text-psl-navy px-3 whitespace-nowrap">
                        {f.homeScore !== null && f.awayScore !== null
                          ? `${f.homeScore} – ${f.awayScore}`
                          : 'vs'}
                      </span>
                      <span className="text-sm font-bold text-psl-navy truncate flex-1 text-right">
                        {f.awayTeam.shortName}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {new Date(f.kickoffAt).toLocaleDateString('en-ZA', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {f.venue && <span className="ml-2">· {f.venue.name}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Feature Hub ──────────────────────────────────────────────── */}
        <section className="py-12 px-4 bg-white" aria-label="Platform features">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-psl-navy">Play &amp; Compete</h2>
              <p className="text-sm text-gray-500 mt-1">
                All gameplay is points-only — no real money, no bets, no stakes.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURE_CARDS.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="block rounded-xl border border-gray-100 border-l-4 p-6 hover:shadow-lg transition-all"
                  style={{ borderLeftColor: card.accent }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black mb-4"
                    style={{
                      backgroundColor: `${card.accent}1a`,
                      color: card.accent,
                    }}
                  >
                    {card.label}
                  </div>
                  <div className="font-bold text-psl-navy text-base mb-1">{card.title}</div>
                  <div className="text-sm text-gray-500 leading-snug">{card.description}</div>
                  <div className="mt-3 text-xs text-gray-400 font-medium">Points only →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Teams ────────────────────────────────────────────────────── */}
        {teams.length > 0 && (
          <section className="py-12 px-4 bg-gray-50" aria-label="Teams">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-psl-navy">Teams</h2>
                <Link
                  href="/clubs"
                  className="text-sm font-medium text-psl-navy/60 hover:text-psl-navy transition-colors"
                >
                  All clubs →
                </Link>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-full bg-psl-navy flex items-center justify-center text-white text-xs font-bold mb-1.5">
                      {t.shortName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-600 text-center leading-tight truncate w-full">
                      {t.shortName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Latest Media ─────────────────────────────────────────────── */}
        {media.length > 0 && (
          <section className="py-12 px-4 bg-white" aria-label="Latest media">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-psl-navy">Latest Media</h2>
                <Link
                  href="/media"
                  className="text-sm font-medium text-psl-navy/60 hover:text-psl-navy transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {media.map((a) => (
                  <Link
                    key={a.id}
                    href={`/media/${a.slug}`}
                    className="block rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                  >
                    <div className="h-32 bg-gradient-to-br from-psl-navy to-psl-green flex items-center justify-center">
                      <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
                        {a.mediaType}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-psl-navy group-hover:text-psl-green transition-colors leading-snug">
                        {a.title}
                      </h3>
                      {a.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{a.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Campaigns / Sponsor Activation ───────────────────────────── */}
        {campaigns.length > 0 && (
          <section className="py-12 px-4 bg-gray-50" aria-label="Fan campaigns">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-psl-navy">Fan Campaigns</h2>
                <Link
                  href="/campaigns"
                  className="text-sm font-medium text-psl-navy/60 hover:text-psl-navy transition-colors"
                >
                  All campaigns →
                </Link>
              </div>
              <p className="text-xs text-gray-400 mb-5">
                Fan Value points are non-cash loyalty points — not money, betting credits, or a
                withdrawable balance.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {campaigns.map((c) => (
                  <Link
                    key={c.id}
                    href={`/campaigns/${c.slug}`}
                    className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all"
                  >
                    <h3 className="font-bold text-psl-navy">{c.name}</h3>
                    {c.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Fan Journey ──────────────────────────────────────────────── */}
        <section className="py-12 px-4 bg-psl-navy text-white" aria-label="Fan journey">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Your Fan Journey</h2>
              <p className="text-sm text-white/60 mt-1">
                Track your points, achievements, and reward readiness — all non-financial.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {FAN_JOURNEY.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block bg-white/10 hover:bg-white/20 rounded-xl p-5 transition-colors"
                >
                  <div className="font-bold text-base mb-1">{item.title}</div>
                  <div className="text-xs text-white/60 leading-relaxed">{item.description}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className="bg-psl-dark text-white py-12 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-10">
              <div>
                <div className="text-lg font-black mb-3">
                  PSL <span className="text-psl-gold">One</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  The digital operating system of South African football. Beta platform —
                  FIFA World Cup 2026.
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                  Play
                </h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/fantasy" className="hover:text-white transition-colors">Fantasy Football</Link></li>
                  <li><Link href="/predictions" className="hover:text-white transition-colors">Predictions</Link></li>
                  <li><Link href="/social-challenges" className="hover:text-white transition-colors">Social Challenges</Link></li>
                  <li><Link href="/leaderboards" className="hover:text-white transition-colors">Leaderboards</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                  Football
                </h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/matches" className="hover:text-white transition-colors">Matches</Link></li>
                  <li><Link href="/clubs" className="hover:text-white transition-colors">Clubs</Link></li>
                  <li><Link href="/players" className="hover:text-white transition-colors">Players</Link></li>
                  <li><Link href="/media" className="hover:text-white transition-colors">Media</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                  Account
                </h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/profile" className="hover:text-white transition-colors">Profile</Link></li>
                  <li><Link href="/fan-value" className="hover:text-white transition-colors">Fan Value</Link></li>
                  <li><Link href="/achievements" className="hover:text-white transition-colors">Achievements</Link></li>
                  <li><Link href="/rewards" className="hover:text-white transition-colors">Rewards</Link></li>
                  <li><Link href="/wallet" className="hover:text-white transition-colors">Wallet (Sandbox)</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 space-y-2">
              <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
                PSL One is in controlled beta. All gameplay uses points only — no real money, no
                deposits, no withdrawals. Fantasy and prediction results affect platform leaderboards
                only. Fan Value is a non-financial loyalty score. This platform is not a betting or
                gambling product.
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                <span>© 2026 PSL One</span>
                <span>·</span>
                <span className="font-mono text-psl-gold/60">{meta.environment.toUpperCase()}</span>
                <span>·</span>
                <Link href="/beta" className="hover:text-gray-300 transition-colors">Beta Info</Link>
                <span>·</span>
                <Link href="/health" className="hover:text-gray-300 transition-colors">System Health</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* ── Mobile Bottom Navigation ──────────────────────────────────── */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
          {[
            { href: '/', label: 'Home', active: true },
            { href: '/matches', label: 'Matches', active: false },
            { href: '/fantasy', label: 'Fantasy', active: false },
            { href: '/predictions', label: 'Predict', active: false },
            { href: '/profile', label: 'Profile', active: false },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                item.active ? 'text-psl-navy' : 'text-gray-400 hover:text-psl-navy'
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full mb-0.5 ${
                  item.active ? 'bg-psl-gold' : 'bg-transparent'
                }`}
              />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
