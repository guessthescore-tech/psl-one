'use client';
/**
 * Admin — Club Shop overview.
 * PSL_INACTIVE - do not activate PSL season.
 * CATALOGUE_ONLY — no checkout, no payment processing.
 * Requires PSL_ADMIN role.
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_SHOPS = [
  { club: 'Kaizer Chiefs', slug: 'kaizer-chiefs', products: 8, published: 6, revenue: 'N/A' },
  { club: 'Orlando Pirates', slug: 'orlando-pirates', products: 6, published: 4, revenue: 'N/A' },
  { club: 'Mamelodi Sundowns', slug: 'mamelodi-sundowns', products: 10, published: 8, revenue: 'N/A' },
  { club: 'Cape Town City', slug: 'cape-town-city', products: 4, published: 3, revenue: 'N/A' },
  { club: 'Stellenbosch FC', slug: 'stellenbosch-fc', products: 3, published: 2, revenue: 'N/A' },
  { club: 'SuperSport United', slug: 'supersport-united', products: 5, published: 5, revenue: 'N/A' },
];

export default function AdminShopPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Club Shops</h1>
            <p className="text-slate-400 text-sm">
              Merchandise catalogue overview for all PSL clubs. Checkout is not enabled (ADR-033).
            </p>
          </div>
          <span className="text-xs bg-amber-900/40 text-amber-400 border border-amber-800/40 rounded-full px-3 py-1 font-semibold">
            CATALOGUE ONLY
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Total Products</p>
            <p className="text-2xl font-black text-white">36</p>
            <p className="text-slate-500 text-xs mt-1">across all clubs</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Published</p>
            <p className="text-2xl font-black text-green-400">28</p>
            <p className="text-slate-500 text-xs mt-1">visible to fans</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Commerce Status</p>
            <p className="text-sm font-bold text-amber-400 mt-2">CATALOGUE_ONLY</p>
            <p className="text-slate-500 text-xs mt-1">no checkout enabled</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white">Club Shop Status</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Club</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Products</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Published</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MOCK_SHOPS.map((shop) => (
                <tr key={shop.slug} className="hover:bg-slate-800/30">
                  <td className="px-6 py-3 text-sm font-medium text-white">{shop.club}</td>
                  <td className="px-6 py-3 text-sm text-slate-300">{shop.products}</td>
                  <td className="px-6 py-3 text-sm text-green-400">{shop.published}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">{shop.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm">
            <span className="text-amber-400 font-semibold">API Routes:</span>{' '}
            <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">
              GET /club-experience/:slug/shop
            </code>{' '}
            ·{' '}
            <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">
              GET /club-experience/admin/:id/shop/readiness
            </code>
          </p>
        </div>
      </div>
    </PortalShell>
  );
}
