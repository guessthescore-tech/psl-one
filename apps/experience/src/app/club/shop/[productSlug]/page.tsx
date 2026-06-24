'use client';
/**
 * Club portal — product detail page.
 * CATALOGUE_ONLY — view-only. No add-to-cart, no checkout.
 */

import { PortalShell } from '../../../../components/portal/PortalShell';
import { CLUB_NAV_ITEMS } from '../../../../lib/portal-routes';
import { useParams } from 'next/navigation';

export default function ClubShopProductPage() {
  const params = useParams<{ productSlug: string }>();
  const slug = params?.productSlug ?? 'product';

  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-2xl space-y-6">
        <div>
          <a href="/club/shop" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Back to Shop
          </a>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-slate-600 text-sm">Product image placeholder</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{slug.replace(/-/g, ' ')}</h1>
            <p className="text-slate-400 text-sm mt-1">
              Product slug: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">{slug}</code>
            </p>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-slate-800">
            <span className="text-2xl font-bold text-white">R 999</span>
            <span className="text-xs bg-green-900/40 text-green-400 border border-green-800/40 rounded-full px-3 py-1 font-semibold">
              IN STOCK
            </span>
          </div>
          <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-xl">
            <p className="text-amber-400 text-sm">
              🛒 Catalogue only — checkout not yet available. See ADR-033.
            </p>
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm">
            <span className="text-amber-400 font-semibold">API Route:</span>{' '}
            <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">
              GET /club-experience/:clubSlug/shop/:productSlug
            </code>
          </p>
        </div>
      </div>
    </PortalShell>
  );
}
