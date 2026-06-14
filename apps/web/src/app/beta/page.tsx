'use client';

import Link from 'next/link';

export default function BetaLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-black text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div>
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">PSL One — Beta</p>
          <h1 className="text-4xl font-black">The Digital Operating System of South African Football</h1>
          <p className="text-gray-400 mt-4 text-lg">You have been invited to join the PSL One beta. Experience Fantasy Football, Guess the Score, Social Prediction Challenges, Live Match Intelligence, Fan Value, Achievements, Campaigns and more.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {[
            { label: 'Fantasy Football', desc: 'Pick your squad, earn points, climb the league', href: '/fantasy' },
            { label: 'Guess the Score', desc: 'Predict match results before kick-off', href: '/predictions' },
            { label: 'Social Challenges', desc: 'Challenge friends to points-based prediction duels', href: '/social-predictions' },
            { label: 'Match Centre', desc: 'Live standings, form, and player ratings', href: '/match-centre' },
            { label: 'Fan Value', desc: 'Your non-financial engagement score', href: '/fan-value' },
            { label: 'Leaderboards', desc: 'See where you rank among PSL fans', href: '/leaderboards' },
          ].map(({ label, desc, href }) => (
            <Link
              key={href}
              href={href}
              className="border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-colors"
            >
              <p className="font-semibold">{label}</p>
              <p className="text-sm text-gray-400 mt-1">{desc}</p>
            </Link>
          ))}
        </div>

        <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-white/10">
          <p>Beta notice: PSL One is in controlled beta. All gameplay uses points only — no real money, no deposits, no withdrawals.</p>
          <p>Fantasy and prediction results affect platform leaderboards only. Fan Value is a non-financial loyalty score.</p>
          <p>This platform is not a betting or gambling product.</p>
        </div>
      </div>
    </div>
  );
}
