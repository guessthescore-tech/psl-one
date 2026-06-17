'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DesignLabProvider, useDesignLab } from '@/components/design-lab/DesignLabToolbar';
import { profileClient, type FanProfile, type NotificationPreferences } from '@/lib/profile-client';
import { footballClient, type Team } from '@/lib/football-client';
import { fanValueClient, type FanValueSummary } from '@/lib/fan-value-client';
import { me, type MeResponse } from '@/lib/auth-client';

/* ─── Auth tab ──────────────────────────────────────────────────── */
type AuthTab = 'sign-in' | 'join';

function AuthPanel({ onAuth }: { onAuth: () => void }) {
  const [tab, setTab]           = useState<AuthTab>('join');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDN]    = useState('');
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      /* In the design lab we just simulate success — no real auth */
      await new Promise(r => setTimeout(r, 600));
      setMsg(tab === 'join' ? 'Account created — this is a demo' : 'Signed in — this is a demo');
      onAuth();
    } catch {
      setMsg('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Tab switcher */}
      <div className="flex rounded-xl overflow-hidden border border-gray-100 mb-6 bg-white">
        {(['join', 'sign-in'] as AuthTab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setMsg(''); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors capitalize ${
              tab === t ? 'bg-psl-navy text-white' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t === 'join' ? 'Join Beta' : 'Sign In'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-black text-psl-navy">
          {tab === 'join' ? 'Create your fan account' : 'Welcome back'}
        </h2>

        {tab === 'join' && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDN(e.target.value)}
              placeholder="Your fan name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-psl-navy"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-psl-navy"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-psl-navy"
          />
        </div>

        {msg && (
          <p className="text-xs text-psl-green font-semibold">{msg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-psl-navy text-white py-3 rounded-xl font-bold text-sm hover:bg-psl-navy/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Please wait…' : tab === 'join' ? 'Create account' : 'Sign in'}
        </button>

        {/* Social login placeholders */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative text-center">
            <span className="bg-white px-3 text-xs text-gray-400">or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-xs text-gray-400 disabled:cursor-not-allowed">
            <span className="font-bold">G</span> Google
          </button>
          <button type="button" disabled className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-xs text-gray-400 disabled:cursor-not-allowed">
            <span className="font-bold">f</span> Facebook
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center">Social login requires configuration in a live environment</p>

        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          By joining you agree to our Terms of Service. PSL One is a points-only fan engagement platform — not a gambling or betting service.
        </p>
      </form>
    </div>
  );
}

/* ─── Club selector ─────────────────────────────────────────────── */
function ClubSelector({
  teams,
  selected,
  onSelect,
}: {
  teams: Team[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 mb-3">Select your favourite team</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {teams.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            aria-pressed={selected === t.id}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
              selected === t.id
                ? 'border-psl-navy bg-psl-navy/5'
                : 'border-transparent hover:border-gray-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${
              selected === t.id ? 'bg-psl-navy text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {t.shortName.slice(0, 3).toUpperCase()}
            </div>
            <span className="text-[9px] font-semibold text-gray-500 truncate w-full text-center">
              {t.shortName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Notification prefs ─────────────────────────────────────────── */
function NotificationPrefsPanel({
  prefs,
  onChange,
}: {
  prefs: Partial<NotificationPreferences>;
  onChange: (key: keyof NotificationPreferences, val: boolean) => void;
}) {
  const items: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
    { key: 'matchReminders', label: 'Match Reminders', desc: 'Get notified before kick-off' },
    { key: 'teamNews',        label: 'Team News',       desc: 'Squad updates and injury alerts' },
    { key: 'fantasyUpdates',  label: 'Fantasy Updates', desc: 'Deadline alerts and score updates' },
    { key: 'rewardsUpdates',  label: 'Fan Value',       desc: 'Points earned and milestone alerts' },
  ];

  return (
    <div className="space-y-3">
      {items.map(item => (
        <label key={item.key} className="flex items-start justify-between gap-4 cursor-pointer">
          <div>
            <div className="text-sm font-semibold text-psl-navy">{item.label}</div>
            <div className="text-xs text-gray-400">{item.desc}</div>
          </div>
          <button
            role="switch"
            aria-checked={!!prefs[item.key]}
            onClick={() => onChange(item.key, !prefs[item.key])}
            className={`shrink-0 w-10 h-6 rounded-full transition-colors relative ${
              prefs[item.key] ? 'bg-psl-green' : 'bg-gray-200'
            }`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
              prefs[item.key] ? 'left-5' : 'left-1'
            }`} />
          </button>
        </label>
      ))}
    </div>
  );
}

/* ─── Fan Identity card ─────────────────────────────────────────── */
function FanIdentityCard({
  user,
  profile,
  fanValue,
  teams,
}: {
  user: MeResponse | null;
  profile: FanProfile | null;
  fanValue: FanValueSummary | null;
  teams: Team[];
}) {
  const team = teams.find(t => t.id === profile?.preferredTeamId);
  return (
    <div className="bg-gradient-to-br from-psl-navy to-[#163060] rounded-2xl p-5 text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Fan Identity</div>
          <h3 className="text-xl font-black">{profile?.displayName ?? user?.email ?? 'Anonymous Fan'}</h3>
          <div className="text-xs text-white/50 mt-0.5">{user?.email}</div>
        </div>
        <div className="w-12 h-12 rounded-full bg-psl-gold flex items-center justify-center text-psl-navy font-black text-lg">
          {(profile?.displayName ?? user?.email ?? 'F').charAt(0).toUpperCase()}
        </div>
      </div>

      {team && (
        <div className="flex items-center gap-2 mb-4 bg-white/10 rounded-xl p-3">
          <div className="w-8 h-8 rounded-full bg-psl-gold flex items-center justify-center text-psl-navy text-xs font-black">
            {team.shortName.slice(0, 2)}
          </div>
          <div>
            <div className="text-xs text-white/50">Favourite Club</div>
            <div className="text-sm font-black">{team.name}</div>
          </div>
        </div>
      )}

      {fanValue && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-psl-gold">{fanValue.totalPoints.toLocaleString()}</div>
            <div className="text-[10px] text-white/50">Fan Value Points</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-psl-gold">{fanValue.totalEntries}</div>
            <div className="text-[10px] text-white/50">Total Actions</div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-white/30 leading-relaxed">
        Points are non-financial and cannot be redeemed for cash. PSL One is not a gambling product.
      </p>
    </div>
  );
}

/* ─── Wallet notice ─────────────────────────────────────────────── */
function WalletNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <div className="text-amber-500 text-lg shrink-0">⚠</div>
        <div>
          <h3 className="text-sm font-bold text-amber-800 mb-1">Sandbox Wallet</h3>
          <p className="text-xs text-amber-700 leading-relaxed">
            Your wallet is in <strong>sandbox mode</strong>. No real money is involved. Points earned here are
            fan value points only. Real-money features require identity verification and are not available
            in the beta.
          </p>
          <p className="text-xs text-amber-600 mt-2">
            PSL One is a fan engagement platform — not a gambling or betting service. All fan value points are non-financial.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main content ───────────────────────────────────────────────── */
function AccountContent() {
  const { dataState, theme } = useDesignLab();

  const [user, setUser]           = useState<MeResponse | null>(null);
  const [profile, setProfile]     = useState<FanProfile | null>(null);
  const [fanValue, setFanValue]   = useState<FanValueSummary | null>(null);
  const [teams, setTeams]         = useState<Team[]>([]);
  const [prefs, setPrefs]         = useState<Partial<NotificationPreferences>>({
    matchReminders: true, teamNews: true, fantasyUpdates: true, rewardsUpdates: false,
  });
  const [loading, setLoading]     = useState(true);
  const [authed, setAuthed]       = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'club' | 'notifications' | 'wallet'>('profile');

  useEffect(() => {
    if (dataState === 'loading') { setLoading(true); return; }
    if (dataState === 'empty')   { setLoading(false); setUser(null); setProfile(null); return; }
    if (dataState === 'error')   { setLoading(false); return; }

    setLoading(true);
    Promise.allSettled([
      me().then(u => { setUser(u); setAuthed(true); }),
      profileClient.getProfile().then(setProfile),
      fanValueClient.getSummary().then(setFanValue),
      profileClient.getPreferences().then(p => setPrefs(p)),
      footballClient.getActiveSeason()
        .then(s => footballClient.listTeams({ seasonSlug: s.slug }))
        .then(t => setTeams(t.slice(0, 16))),
    ]).finally(() => setLoading(false));
  }, [dataState]);

  const bg   = theme === 'dark' ? 'bg-psl-dark'   : 'bg-gray-50';
  const card = theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100';
  const head = theme === 'dark' ? 'text-white' : 'text-psl-navy';

  const SECTIONS: { id: typeof activeSection; label: string }[] = [
    { id: 'profile',       label: 'Profile' },
    { id: 'club',          label: 'My Club' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'wallet',        label: 'Wallet' },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="w-12 h-12 rounded-full border-4 border-psl-navy/20 border-t-psl-navy animate-spin" />
      </div>
    );
  }

  /* Not authenticated — show auth panel */
  if (!authed && dataState === 'real') {
    return (
      <div className={`min-h-screen ${bg} py-12 px-4`}>
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
            {/* Auth form */}
            <AuthPanel onAuth={() => setAuthed(true)} />

            {/* Right: Feature highlights */}
            <div className="hidden lg:block space-y-6 pt-4">
              <div>
                <h2 className={`text-3xl font-black ${head} mb-2`}>The digital home of South African football</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Join thousands of fans tracking their teams, making predictions, and building their fantasy squads.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { icon: '⚽', title: 'Pick your squad', desc: 'Build a fantasy team from real WC 2026 players' },
                  { icon: '🏆', title: 'Predict and earn', desc: 'Guess scores and earn fan value points' },
                  { icon: '📊', title: 'Follow the action', desc: 'Live scores, stats, and match analysis' },
                  { icon: '🌍', title: 'Community', desc: 'Compete with fans across South Africa' },
                ].map(f => (
                  <div key={f.title} className="flex gap-3">
                    <span className="text-xl">{f.icon}</span>
                    <div>
                      <div className={`text-sm font-bold ${head}`}>{f.title}</div>
                      <div className="text-xs text-gray-400">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-psl-navy/5 border border-psl-navy/10 p-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong className="text-psl-navy">Points-only platform.</strong> All gameplay earns fan value points.
                  No real money, no bets, no gambling. PSL One is not a gambling product.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} pb-20 md:pb-0`}>
      {/* Header */}
      <div className="bg-psl-navy text-white px-4 py-4 border-b border-white/10">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <h1 className="text-xl font-black">Account</h1>
          <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors">
            Back to home →
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Fan identity card + nav */}
          <div className="space-y-4">
            <FanIdentityCard user={user} profile={profile} fanValue={fanValue} teams={teams} />

            {/* Section nav */}
            <nav className={`rounded-xl border ${card} overflow-hidden`}>
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full text-left px-4 py-3 text-sm font-semibold border-b border-gray-50 last:border-0 transition-colors ${
                    activeSection === s.id
                      ? 'bg-psl-navy text-white'
                      : `${head} hover:bg-gray-50`
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Section content */}
          <div className="lg:col-span-2">
            {activeSection === 'profile' && (
              <div className={`rounded-2xl border ${card} p-6 space-y-5`}>
                <h2 className={`text-base font-black ${head}`}>Profile Details</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      defaultValue={profile?.displayName ?? ''}
                      placeholder="Your fan name"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-psl-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">City</label>
                    <input
                      type="text"
                      defaultValue={profile?.city ?? ''}
                      placeholder="Johannesburg"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-psl-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Country</label>
                    <input
                      type="text"
                      defaultValue={profile?.country ?? 'South Africa'}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-psl-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.email ?? ''}
                      disabled
                      className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="bg-psl-navy text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-psl-navy/90 transition-colors">
                    Save changes
                  </button>
                  <button className="border border-gray-200 text-gray-500 px-5 py-2 rounded-lg text-sm font-semibold hover:border-gray-400 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'club' && (
              <div className={`rounded-2xl border ${card} p-6`}>
                <h2 className={`text-base font-black ${head} mb-4`}>Favourite Club</h2>
                <ClubSelector
                  teams={teams}
                  selected={profile?.preferredTeamId ?? null}
                  onSelect={() => {}}
                />
                <button className="mt-5 bg-psl-navy text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-psl-navy/90 transition-colors">
                  Save preference
                </button>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className={`rounded-2xl border ${card} p-6 space-y-5`}>
                <h2 className={`text-base font-black ${head}`}>Notification Preferences</h2>
                <NotificationPrefsPanel
                  prefs={prefs}
                  onChange={(key, val) => setPrefs(p => ({ ...p, [key]: val }))}
                />
                <button className="bg-psl-navy text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-psl-navy/90 transition-colors">
                  Save preferences
                </button>
              </div>
            )}

            {activeSection === 'wallet' && (
              <div className="space-y-4">
                <WalletNotice />
                <div className={`rounded-2xl border ${card} p-6`}>
                  <h2 className={`text-base font-black ${head} mb-3`}>Fan Value Summary</h2>
                  {fanValue ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Total Points</span>
                        <span className="text-xl font-black text-psl-gold">{fanValue.totalPoints.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Total Actions</span>
                        <span className="text-sm font-bold text-psl-navy">{fanValue.totalEntries}</span>
                      </div>
                      {fanValue.recentEntries.slice(0, 4).map(e => (
                        <div key={e.id} className="flex items-center justify-between py-1.5 text-xs border-b border-gray-50 last:border-0">
                          <span className="text-gray-500 truncate">{String(e.valueType).replace(/_/g, ' ')}</span>
                          <span className="text-psl-gold font-bold ml-2">+{e.points}</span>
                        </div>
                      ))}
                      <p className="text-[10px] text-gray-400 pt-2">{fanValue.nonFinancialDisclaimer}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No fan value data available</p>
                  )}
                  <Link href="/fan-value" className="mt-4 block text-center text-xs text-psl-navy/60 hover:text-psl-navy transition-colors">
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

/* ─── Page ──────────────────────────────────────────────────────── */
export default function AccountPage() {
  return (
    <DesignLabProvider defaultMode="IN_SEASON">
      <AccountContent />
    </DesignLabProvider>
  );
}
