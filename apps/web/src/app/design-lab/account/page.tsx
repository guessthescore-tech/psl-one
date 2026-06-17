'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DesignLabProvider, useDesignLab } from '@/components/design-lab/DesignLabToolbar';
import { profileClient, type FanProfile, type NotificationPreferences } from '@/lib/profile-client';
import { footballClient, type Team } from '@/lib/football-client';
import { fanValueClient, type FanValueSummary } from '@/lib/fan-value-client';
import { me, type MeResponse } from '@/lib/auth-client';

/* ── Fan Identity Card — physical card aesthetic ───────────────── */
function FanIdentityCard({
  user, profile, fanValue, teams,
}: {
  user: MeResponse | null;
  profile: FanProfile | null;
  fanValue: FanValueSummary | null;
  teams: Team[];
}) {
  const team = teams.find(t => t.id === profile?.preferredTeamId);
  const initials = (profile?.displayName ?? user?.email ?? 'F').charAt(0).toUpperCase();
  const level = fanValue ? Math.floor(fanValue.totalPoints / 500) + 1 : 1;
  const nextLevelPts = level * 500;
  const progress = fanValue ? Math.min(100, Math.round(((fanValue.totalPoints % 500) / 500) * 100)) : 0;

  return (
    <div
      className="relative rounded-card overflow-hidden text-white shadow-card-xl"
      style={{ background: 'linear-gradient(135deg, #0d1b2e 0%, #1b3a6b 55%, #163060 100%)' }}
      aria-label="Fan identity card"
    >
      {/* Watermark circle */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute -top-2 -right-2 w-24 h-24 rounded-full border border-white/5 pointer-events-none" />

      <div className="relative p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-label-sm text-white/40 mb-2">My PSL One</p>
            <h2 className="text-display-sm text-white leading-tight">
              {profile?.displayName ?? user?.email ?? 'Fan'}
            </h2>
            {user?.email && profile?.displayName && (
              <p className="text-xs text-white/40 mt-0.5">{user.email}</p>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-psl-gold flex items-center justify-center text-psl-midnight font-black text-lg flex-shrink-0">
            {initials}
          </div>
        </div>

        {/* Club badge */}
        {team && (
          <div className="flex items-center gap-3 bg-white/10 rounded-card-sm px-3 py-2.5 mb-5">
            <div className="w-8 h-8 rounded-full bg-psl-gold flex items-center justify-center text-psl-midnight text-xs font-black flex-shrink-0">
              {team.shortName.slice(0, 2)}
            </div>
            <div>
              <p className="text-[10px] text-white/40">Favourite Club</p>
              <p className="text-sm font-bold text-white">{team.name}</p>
            </div>
          </div>
        )}

        {/* Fan value stats */}
        {fanValue && (
          <div className="mb-4">
            <div className="flex items-end justify-between mb-2">
              <div>
                <div className="text-stat-lg text-psl-gold tabular-nums leading-none">{fanValue.totalPoints.toLocaleString()}</div>
                <div className="text-[10px] text-white/40 mt-0.5">fan value points · non-financial</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-white">Level {level}</div>
                <div className="text-[10px] text-white/40">{nextLevelPts - (fanValue.totalPoints % 500)} to next</div>
              </div>
            </div>
            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-psl-gold rounded-full motion-safe:transition-all motion-safe:duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <p className="text-[10px] text-white/20 leading-relaxed">
          Points are non-financial. PSL One is not a gambling or betting product.
        </p>
      </div>
    </div>
  );
}

/* ── Auth panel ────────────────────────────────────────────────── */
type AuthTab = 'join' | 'sign-in';

function AuthPanel({ onAuth }: { onAuth: () => void }) {
  const [tab, setTab]           = useState<AuthTab>('join');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDN]    = useState('');
  const [submitting, setSubmit] = useState(false);
  const [msg, setMsg]           = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmit(true);
    setMsg('');
    await new Promise(r => setTimeout(r, 600));
    setMsg(tab === 'join' ? 'Account created — this is a design demo' : 'Signed in — this is a design demo');
    setSubmit(false);
    onAuth();
  }

  return (
    <div className="w-full">
      {/* Tab switcher */}
      <div className="flex rounded-card-sm border border-[#e8eaf0] mb-6 overflow-hidden bg-white">
        {(['join', 'sign-in'] as AuthTab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setMsg(''); }}
            className={`flex-1 py-3 text-sm font-semibold motion-safe:transition-colors focus-visible:outline-none ${
              tab === t ? 'bg-psl-navy text-white' : 'text-psl-muted hover:text-psl-navy'
            }`}
          >
            {t === 'join' ? 'Join Beta' : 'Sign In'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-card border border-[#e8eaf0] p-6 space-y-4 shadow-card-md">
        <h2 className="text-display-sm text-psl-navy">
          {tab === 'join' ? 'Create your fan account' : 'Welcome back'}
        </h2>

        {tab === 'join' && (
          <div>
            <label className="block text-label-sm text-psl-muted mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDN(e.target.value)}
              placeholder="Your fan name"
              className="w-full border border-[#e8eaf0] rounded-card-sm px-3 py-3 text-sm text-psl-navy focus:outline-none focus:border-psl-navy motion-safe:transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block text-label-sm text-psl-muted mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-[#e8eaf0] rounded-card-sm px-3 py-3 text-sm text-psl-navy focus:outline-none focus:border-psl-navy motion-safe:transition-colors"
          />
        </div>

        <div>
          <label className="block text-label-sm text-psl-muted mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-[#e8eaf0] rounded-card-sm px-3 py-3 text-sm text-psl-navy focus:outline-none focus:border-psl-navy motion-safe:transition-colors"
          />
        </div>

        {msg && <p className="text-xs text-psl-green font-semibold">{msg}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-psl-navy text-white py-3 rounded-card-sm font-bold text-sm hover:bg-psl-navy/90 motion-safe:transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy"
        >
          {submitting ? 'Please wait…' : tab === 'join' ? 'Create account' : 'Sign in'}
        </button>

        {/* Social divider */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#f0f2f8]" />
          </div>
          <div className="relative text-center">
            <span className="bg-white px-3 text-xs text-psl-muted">or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled className="flex items-center justify-center gap-2 border border-[#e8eaf0] rounded-card-sm py-2.5 text-xs text-psl-muted disabled:cursor-not-allowed">
            <span className="font-bold">G</span> Google
          </button>
          <button type="button" disabled className="flex items-center justify-center gap-2 border border-[#e8eaf0] rounded-card-sm py-2.5 text-xs text-psl-muted disabled:cursor-not-allowed">
            <span className="font-bold">f</span> Facebook
          </button>
        </div>

        <p className="text-[10px] text-psl-muted text-center">Social login requires configuration in a live environment.</p>

        <p className="text-[10px] text-psl-muted text-center leading-relaxed">
          By joining you agree to our Terms. PSL One is a points-only fan engagement platform — not a gambling service.
        </p>
      </form>
    </div>
  );
}

/* ── Club selector ─────────────────────────────────────────────── */
function ClubSelector({ teams, selected, onSelect }: {
  teams: Team[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-label-sm text-psl-muted mb-3">Select your favourite team</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {teams.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            aria-pressed={selected === t.id}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-card-sm border-2 min-h-[44px] motion-safe:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy ${
              selected === t.id
                ? 'border-psl-navy bg-psl-navy/5 shadow-card'
                : 'border-transparent hover:border-[#e8eaf0]'
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black ${
              selected === t.id ? 'bg-psl-navy text-white' : 'bg-[#f0f2f8] text-psl-muted'
            }`}>
              {t.shortName.slice(0, 3).toUpperCase()}
            </div>
            <span className="text-[9px] font-semibold text-psl-muted truncate w-full text-center">{t.shortName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Notification prefs ────────────────────────────────────────── */
function NotificationPrefsPanel({ prefs, onChange }: {
  prefs: Partial<NotificationPreferences>;
  onChange: (key: keyof NotificationPreferences, val: boolean) => void;
}) {
  const items: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
    { key: 'matchReminders', label: 'Match Reminders',  desc: 'Notified before kick-off' },
    { key: 'teamNews',        label: 'Team News',         desc: 'Squad updates and injury alerts' },
    { key: 'fantasyUpdates',  label: 'Fantasy Updates',   desc: 'Deadline alerts and score updates' },
    { key: 'rewardsUpdates',  label: 'Fan Value',         desc: 'Points earned and milestone alerts' },
  ];

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.key} className="flex items-center justify-between gap-4 py-0.5">
          <div>
            <div className="text-sm font-semibold text-psl-navy">{item.label}</div>
            <div className="text-xs text-psl-muted">{item.desc}</div>
          </div>
          <button
            role="switch"
            aria-checked={!!prefs[item.key]}
            onClick={() => onChange(item.key, !prefs[item.key])}
            className={`flex-shrink-0 w-10 h-6 rounded-pill motion-safe:transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1 ${
              prefs[item.key] ? 'bg-psl-green' : 'bg-[#e8eaf0]'
            }`}
            aria-label={`Toggle ${item.label}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow motion-safe:transition-all ${
              prefs[item.key] ? 'left-5' : 'left-1'
            }`} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── Wallet notice ─────────────────────────────────────────────── */
function WalletNotice() {
  return (
    <div className="rounded-card border border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <div className="w-1 rounded-full bg-amber-400 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-amber-800 mb-1">Sandbox Wallet</h3>
          <p className="text-xs text-amber-700 leading-relaxed">
            Your wallet is in <strong>sandbox mode</strong>. No real money is involved. Points earned are
            fan value points only. Real-money features are not available in the beta.
          </p>
          <p className="text-xs text-amber-600 mt-2">
            PSL One is a fan engagement platform — not a gambling or betting service.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Section input field ───────────────────────────────────────── */
function Field({ label, value, type = 'text', disabled = false, placeholder = '' }: {
  label: string; value: string; type?: string; disabled?: boolean; placeholder?: string;
}) {
  const [val, setVal] = useState(value);
  return (
    <div>
      <label className="block text-label-sm text-psl-muted mb-1.5">{label}</label>
      <input
        type={type}
        value={val}
        onChange={e => setVal(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full border rounded-card-sm px-3 py-2.5 text-sm focus:outline-none motion-safe:transition-colors ${
          disabled
            ? 'border-[#f0f2f8] bg-[#f5f7fb] text-psl-muted cursor-not-allowed'
            : 'border-[#e8eaf0] text-psl-navy focus:border-psl-navy'
        }`}
      />
    </div>
  );
}

/* ── Unauthenticated split-screen ──────────────────────────────── */
function UnauthView({ onAuth }: { onAuth: () => void }) {
  return (
    <div className="flex min-h-screen">
      {/* Left: dark brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-psl-midnight text-white p-12">
        <div>
          <p className="text-label-md text-white/30 mb-8">My PSL One</p>
          <h1 className="text-display-xl text-white leading-tight mb-4">
            The digital home of South African football
          </h1>
          <p className="text-body-md text-white/50 leading-relaxed mb-10">
            Join thousands of fans tracking their teams, making predictions, and building their fantasy squads.
          </p>
          <div className="space-y-5">
            {[
              { title: 'Pick your squad',    desc: 'Build a fantasy team from real WC 2026 players' },
              { title: 'Predict and earn',   desc: 'Guess scores and earn fan value points' },
              { title: 'Follow the action',  desc: 'Live scores, stats, and match analysis' },
              { title: 'Fan community',      desc: 'Compete with fans across South Africa' },
            ].map(f => (
              <div key={f.title} className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-psl-gold mt-1.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-white">{f.title}</div>
                  <div className="text-xs text-white/40">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-card-sm border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/40 leading-relaxed">
            Points-only platform. All gameplay earns fan value points.
            No real money, no bets, no gambling.
          </p>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex-1 bg-psl-surface flex items-start justify-center py-16 px-6">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <p className="text-label-md text-psl-muted mb-6 lg:hidden">My PSL One</p>
          <AuthPanel onAuth={onAuth} />
        </div>
      </div>
    </div>
  );
}

/* ── Main content ──────────────────────────────────────────────── */
function AccountContent() {
  const { dataState, theme } = useDesignLab();

  const [user, setUser]       = useState<MeResponse | null>(null);
  const [profile, setProfile] = useState<FanProfile | null>(null);
  const [fanValue, setFanValue] = useState<FanValueSummary | null>(null);
  const [teams, setTeams]     = useState<Team[]>([]);
  const [prefs, setPrefs]     = useState<Partial<NotificationPreferences>>({
    matchReminders: true, teamNews: true, fantasyUpdates: true, rewardsUpdates: false,
  });
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed]   = useState(false);
  const [section, setSection] = useState<'profile' | 'club' | 'notifications' | 'wallet'>('profile');

  useEffect(() => {
    if (dataState === 'loading') { setLoading(true); return; }
    if (dataState === 'empty')   { setLoading(false); setUser(null); setProfile(null); return; }
    if (dataState === 'error')   { setLoading(false); return; }

    setLoading(true);
    Promise.allSettled([
      me().then(u => { setUser(u); setAuthed(true); }),
      profileClient.getProfile().then(setProfile),
      fanValueClient.getSummary().then(setFanValue),
      profileClient.getPreferences().then(setPrefs),
      footballClient.getActiveSeason()
        .then(s => footballClient.listTeams({ seasonSlug: s.slug }))
        .then(t => setTeams(t.slice(0, 16))),
    ]).finally(() => setLoading(false));
  }, [dataState]);

  const isDark  = theme === 'dark';
  const bg      = isDark ? 'bg-psl-dark'    : 'bg-psl-surface';
  const card    = isDark ? 'bg-psl-card-dk border-white/10' : 'bg-white border-[#e8eaf0]';
  const h       = isDark ? 'text-white'     : 'text-psl-navy';
  const muted   = isDark ? 'text-white/40'  : 'text-psl-muted';

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="w-10 h-10 rounded-full border-4 border-psl-navy/20 border-t-psl-navy motion-safe:animate-spin" />
      </div>
    );
  }

  if (!authed && dataState === 'real') {
    return <UnauthView onAuth={() => setAuthed(true)} />;
  }

  const SECTIONS: { id: typeof section; label: string }[] = [
    { id: 'profile',       label: 'Profile'        },
    { id: 'club',          label: 'My Club'        },
    { id: 'notifications', label: 'Notifications'  },
    { id: 'wallet',        label: 'Wallet'         },
  ];

  return (
    <div className={`min-h-screen ${bg} pb-20 md:pb-0`}>
      {/* Header */}
      <header className="bg-psl-midnight text-white sticky top-0 z-40 shadow-inner-top">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-label-sm text-white/40 mb-0.5">My PSL One</p>
            <h1 className="font-black text-sm text-white">{profile?.displayName ?? user?.email ?? 'Fan Account'}</h1>
          </div>
          <Link href="/" className="text-xs text-white/40 hover:text-white motion-safe:transition-colors">
            Home →
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Identity card + nav */}
          <div className="space-y-4">
            <FanIdentityCard user={user} profile={profile} fanValue={fanValue} teams={teams} />

            <nav className={`rounded-card border ${card} overflow-hidden`} aria-label="Account sections">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`w-full text-left px-4 py-3.5 text-sm font-semibold border-b border-[#f0f2f8] last:border-0 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-psl-navy ${
                    section === s.id
                      ? 'bg-psl-navy text-white'
                      : `${h} hover:bg-[#f5f7fb] dark:hover:bg-white/5`
                  }`}
                  aria-current={section === s.id ? 'page' : undefined}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Section content */}
          <div className="lg:col-span-2">
            {section === 'profile' && (
              <div className={`rounded-card border ${card} p-6 space-y-5`}>
                <h2 className={`text-display-sm ${h}`}>Profile Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Display Name" value={profile?.displayName ?? ''} placeholder="Your fan name" />
                  <Field label="City" value={profile?.city ?? ''} placeholder="Johannesburg" />
                  <Field label="Country" value={profile?.country ?? 'South Africa'} />
                  <Field label="Email" value={user?.email ?? ''} type="email" disabled />
                </div>
                <div className="flex gap-3 pt-2">
                  <button className="bg-psl-navy text-white px-5 py-2.5 rounded-card-sm text-sm font-bold hover:bg-psl-navy/90 motion-safe:transition-colors">
                    Save changes
                  </button>
                  <button className={`border border-[#e8eaf0] ${muted} px-5 py-2.5 rounded-card-sm text-sm font-semibold hover:border-psl-navy/30 motion-safe:transition-colors`}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {section === 'club' && (
              <div className={`rounded-card border ${card} p-6`}>
                <h2 className={`text-display-sm ${h} mb-5`}>Favourite Club</h2>
                <ClubSelector
                  teams={teams}
                  selected={profile?.preferredTeamId ?? null}
                  onSelect={() => {}}
                />
                <button className="mt-5 bg-psl-navy text-white px-5 py-2.5 rounded-card-sm text-sm font-bold hover:bg-psl-navy/90 motion-safe:transition-colors">
                  Save preference
                </button>
              </div>
            )}

            {section === 'notifications' && (
              <div className={`rounded-card border ${card} p-6 space-y-5`}>
                <h2 className={`text-display-sm ${h}`}>Notification Preferences</h2>
                <NotificationPrefsPanel
                  prefs={prefs}
                  onChange={(key, val) => setPrefs(p => ({ ...p, [key]: val }))}
                />
                <button className="bg-psl-navy text-white px-5 py-2.5 rounded-card-sm text-sm font-bold hover:bg-psl-navy/90 motion-safe:transition-colors">
                  Save preferences
                </button>
              </div>
            )}

            {section === 'wallet' && (
              <div className="space-y-4">
                <WalletNotice />
                <div className={`rounded-card border ${card} p-6`}>
                  <h2 className={`text-display-sm ${h} mb-4`}>Fan Value Summary</h2>
                  {fanValue ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2.5 border-b border-[#f0f2f8]">
                        <span className={`text-sm ${muted}`}>Total Points</span>
                        <span className="text-stat-md text-psl-gold tabular-nums leading-none">{fanValue.totalPoints.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-[#f0f2f8]">
                        <span className={`text-sm ${muted}`}>Total Actions</span>
                        <span className={`text-sm font-bold ${h}`}>{fanValue.totalEntries}</span>
                      </div>
                      {fanValue.recentEntries.slice(0, 4).map(e => (
                        <div key={e.id} className="flex items-center justify-between py-2 border-b border-[#f0f2f8] last:border-0 text-xs">
                          <span className={`${muted} truncate capitalize`}>{String(e.valueType).replace(/_/g, ' ').toLowerCase()}</span>
                          <span className="text-psl-gold font-bold ml-3 shrink-0">+{e.points}</span>
                        </div>
                      ))}
                      <p className={`text-[10px] ${muted} pt-2`}>{fanValue.nonFinancialDisclaimer}</p>
                    </div>
                  ) : (
                    <p className={`text-sm ${muted}`}>No fan value data available</p>
                  )}
                  <Link href="/fan-value" className={`mt-4 block text-center text-xs ${muted} hover:${h} motion-safe:transition-colors`}>
                    View full ledger →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <DesignLabProvider defaultMode="IN_SEASON">
      <AccountContent />
    </DesignLabProvider>
  );
}
