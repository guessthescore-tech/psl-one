'use client';
/**
 * Club portal — shop management page.
 * CATALOGUE_ONLY — no checkout, no payment processing.
 * Requires CLUB_ADMIN or PSL_ADMIN role.
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Home Jersey 2026', price: 'R 999', status: 'PUBLISHED', sku: 'KC-HJ-2026' },
  { id: 'p2', name: 'Away Jersey 2026', price: 'R 999', status: 'PUBLISHED', sku: 'KC-AJ-2026' },
  { id: 'p3', name: 'Club Scarf', price: 'R 249', status: 'PUBLISHED', sku: 'KC-SCARF-001' },
  { id: 'p4', name: 'Training Top', price: 'R 649', status: 'DRAFT', sku: 'KC-TT-2026' },
];

export default function ClubShopPage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Club Shop</h1>
            <p className="text-slate-400 text-sm">
              Manage your club&apos;s merchandise catalogue. Checkout is catalogue-only at launch.
            </p>
          </div>
          <span className="text-xs bg-amber-900/40 text-amber-400 border border-amber-800/40 rounded-full px-3 py-1 font-semibold">
            CATALOGUE ONLY
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">Products ({MOCK_PRODUCTS.length})</h2>
            <button
              className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded-lg transition-colors"
              aria-label="Add product"
            >
              + Add Product
            </button>
          </div>
          <div className="divide-y divide-slate-800">
            {MOCK_PRODUCTS.map((product) => (
              <div key={product.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white text-sm">{product.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">SKU: {product.sku}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-300 text-sm font-mono">{product.price}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      product.status === 'PUBLISHED'
                        ? 'bg-green-900/40 text-green-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {product.status}
                  </span>
                  <button
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                    aria-label={`Edit ${product.name}`}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm">
            <span className="text-amber-400 font-semibold">API Route:</span>{' '}
            <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">
              GET /club-experience/:slug/shop
            </code>
            {' '}· No checkout until commerce integration is complete (ADR-033).
          </p>
        </div>
      </div>
    </PortalShell>
  );
}
