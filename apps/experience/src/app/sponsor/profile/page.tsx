'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { SPONSOR_NAV_ITEMS } from '../../../lib/portal-routes';

export default function SponsorProfilePage() {
  return (
    <PortalShell portalName="Sponsor Portal" navItems={SPONSOR_NAV_ITEMS}>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Sponsor Profile</h1>
          <p className="text-slate-400 text-sm">Manage your brand profile and contact information.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          {[
            { id: 'sp-name', label: 'Company Name', placeholder: 'e.g. Castle Lager' },
            { id: 'sp-industry', label: 'Industry', placeholder: 'e.g. Beverages' },
            { id: 'sp-contact', label: 'Contact Email', placeholder: 'sponsor@company.co.za' },
            { id: 'sp-website', label: 'Website', placeholder: 'https://www.company.co.za' },
          ].map(({ id, label, placeholder }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</label>
              <input
                id={id}
                type="text"
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 text-sm"
              />
            </div>
          ))}
          <button
            type="button"
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
          >
            Save Profile (Requires SPONSOR_ADMIN)
          </button>
        </div>
      </div>
    </PortalShell>
  );
}
