'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { FanValuePanel, FantasyGameweekPanel } from '@/components/vision';
import { PSL_CLUBS, PSL_PLAYERS, CURRENT_GAMEWEEK, MOCK_FAN_VALUE, visionImg } from '@/lib/vision-data';

const MOCK_ACHIEVEMENTS = [
  { id: 'a1', label: 'Prediction Streak',    sub: '5 correct in a row', earned: true,  iconBg: '#1b3a6b', iconText: '#ffd700' },
  { id: 'a2', label: 'Fantasy Manager',       sub: 'First team created',  earned: true,  iconBg: '#00843d', iconText: '#fff' },
  { id: 'a3', label: 'Club Loyalist',         sub: 'Kaizer Chiefs fan',   earned: true,  iconBg: '#ffd700', iconText: '#0d1b2e' },
  { id: 'a4', label: 'Social Challenger',     sub: 'First challenge sent', earned: false, iconBg: '#e8eaf0', iconText: '#9ca3af' },
];

const USER = {
  name: 'Sipho Nkosi',
  handle: '@sipho_fpc',
  level: MOCK_FAN_VALUE.level,
  club: PSL_CLUBS[2]!, // Kaizer Chiefs
  avatarSeed: 'football-fan-avatar',
};

export default function VisionAccountPage() {
  const reduce = useReducedMotion();
  const captain = PSL_PLAYERS[0]!;

  return (
    <main className="min-h-[100dvh] bg-psl-surface">

      {/* Vision nav */}
      <nav className="bg-psl-midnight border-b border-white/10 px-6 py-3 flex items-center justify-between" aria-label="Vision studio nav">
        <Link href="/vision" className="text-[10px] font-bold text-white/40 hover:text-white/70 motion-safe:transition-colors flex items-center gap-1.5 focus-visible:outline-none">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Vision Hub
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-widest text-psl-gold">Fan Identity</span>
        <span className="text-[10px] text-white/30 uppercase tracking-wide">Design Review</span>
      </nav>

      {/* Profile header */}
      <section
        className="relative bg-psl-midnight text-white overflow-hidden"
        aria-label="Fan profile"
      >
        {/* Club colour fill */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/3"
          style={{ backgroundColor: USER.club.primaryColor }}
          aria-hidden
        />

        <div className="relative z-10 px-6 pt-8 pb-10 max-w-2xl">
          <div className="flex items-end gap-5 mb-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-psl-gold/40">
                <img src={visionImg(USER.avatarSeed, 160, 160)} alt="" className="w-full h-full object-cover" />
              </div>
              {/* Club badge overlay */}
              <div
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-psl-midnight"
                style={{ backgroundColor: USER.club.primaryColor, color: USER.club.accentColor }}
                aria-hidden
              >{USER.club.abbr}</div>
            </div>

            <div className="pb-1">
              <h1 className="text-display-sm text-white">{USER.name}</h1>
              <p className="text-xs text-white/40 mt-0.5">{USER.handle}</p>
              <div className="inline-flex items-center gap-1.5 bg-psl-gold/20 text-psl-gold text-[10px] font-bold px-2.5 py-1 rounded-pill mt-2">
                {USER.level}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Fan Value',     value: MOCK_FAN_VALUE.total.toLocaleString() },
              { label: 'Global rank',   value: `#${MOCK_FAN_VALUE.rank.toLocaleString()}` },
              { label: 'FPL points',    value: '312' },
            ].map(s => (
              <div key={s.label} className="bg-white/8 rounded-card-sm p-3 text-center">
                <div className="text-stat-sm font-black text-white tabular-nums">{s.value}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-white/25 mt-4">
            All points are non-financial. No real money, no deposits, no withdrawals.
          </p>
        </div>
      </section>

      {/* Fan Value + Fantasy side by side */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FanValuePanel fanValue={MOCK_FAN_VALUE} />
        <FantasyGameweekPanel
          gameweek={CURRENT_GAMEWEEK}
          captain={captain}
          totalPoints={312}
          transfersRemaining={1}
        />
      </div>

      {/* Achievements */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-white rounded-card border border-[#e8eaf0] shadow-card overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[#f0f2f8]">
            <h2 className="text-sm font-black text-psl-navy">Achievements</h2>
            <Link href="/achievements" className="text-xs font-semibold text-psl-gold hover:underline focus-visible:outline-none">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-px bg-[#f0f2f8]">
            {MOCK_ACHIEVEMENTS.map((a, i) => (
              <motion.div
                key={a.id}
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`bg-white p-4 flex items-center gap-3 ${!a.earned ? 'opacity-40' : ''}`}
              >
                <div
                  className="w-10 h-10 rounded-card-sm flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ backgroundColor: a.iconBg, color: a.iconText }}
                  aria-hidden
                >
                  {a.label.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-psl-navy truncate">{a.label}</p>
                  <p className="text-[10px] text-psl-muted">{a.sub}</p>
                  {!a.earned && <p className="text-[10px] text-psl-muted italic">Locked</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Account actions */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Edit profile',    href: '/account',    sub: 'Update name, club, and notification preferences' },
            { label: 'Fan Value',        href: '/fan-value',  sub: 'Full breakdown of your non-financial engagement score' },
            { label: 'Notifications',    href: '/account',    sub: 'Manage match alerts and platform updates' },
            { label: 'Activity feed',    href: '/activity/me', sub: 'See your predictions, challenges and reactions' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="block bg-white rounded-card border border-[#e8eaf0] shadow-card p-4 hover:shadow-card-md motion-safe:transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1"
            >
              <p className="text-sm font-bold text-psl-navy">{item.label}</p>
              <p className="text-xs text-psl-muted mt-1">{item.sub}</p>
              <p className="text-xs font-semibold text-psl-gold mt-2">Open</p>
            </Link>
          ))}
        </div>
      </div>

    </main>
  );
}
