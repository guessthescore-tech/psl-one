'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { SPONSOR_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_ASSETS = [
  { id: 'a1', name: 'Castle Lager Logo.svg', type: 'Logo', size: '24 KB', status: 'approved' },
  { id: 'a2', name: 'WC 2026 Banner.png', type: 'Banner', size: '156 KB', status: 'approved' },
  { id: 'a3', name: 'Campaign Video.mp4', type: 'Video', size: '12.4 MB', status: 'pending' },
];

export default function SponsorAssetsPage() {
  return (
    <PortalShell portalName="Sponsor Portal" navItems={SPONSOR_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Assets</h1>
            <p className="text-slate-400 text-sm">Manage brand assets and creative materials for your campaigns.</p>
          </div>
          <button type="button" className="px-4 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors min-h-[44px]">
            Upload Asset
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ASSETS.map((a) => (
                <tr key={a.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-200">{a.name}</td>
                  <td className="px-4 py-3 text-slate-400">{a.type}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{a.size}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={a.status} variant={a.status === 'approved' ? 'active' : 'warning'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
