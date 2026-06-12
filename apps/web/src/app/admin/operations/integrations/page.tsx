'use client';

import { useEffect, useState } from 'react';
import { getIntegrationProviders, getCommercialReadiness } from '@/lib/admin-operations-client';
import Link from 'next/link';

interface Provider {
  id: string;
  providerType: string;
  providerKey: string;
  displayName: string;
  mode: string;
  status: string;
  isEnabled: boolean;
  isProductionEnabled: boolean;
  requiresComplianceApproval: boolean;
  requiresContractApproval: boolean;
  notes: string | null;
}

interface ProvidersData {
  generatedAt: string;
  safetyNote: string;
  totalProviders: number;
  productionEnabledCount: number;
  providers: Provider[];
}

interface CommercialData {
  gameplayEconomy: Record<string, string>;
  commercialEconomy: Record<string, { status: string; mode?: string; productionEnabled: boolean }>;
  productionStatus: string;
}

const statusColour = (s: string) =>
  s === 'ENABLED' ? 'bg-green-100 text-green-700' :
  s === 'SANDBOX_READY' ? 'bg-teal-100 text-teal-700' :
  s === 'INTEGRATION_READY' ? 'bg-cyan-100 text-cyan-700' :
  s === 'COMPLIANCE_REQUIRED' ? 'bg-yellow-100 text-yellow-700' :
  s === 'PRODUCTION_DISABLED' ? 'bg-red-100 text-red-700' :
  s === 'PROVIDER_REQUIRED' ? 'bg-orange-100 text-orange-700' :
  'bg-gray-100 text-gray-600';

const modeColour = (m: string) =>
  m === 'PRODUCTION' ? 'text-red-600' :
  m === 'SANDBOX' ? 'text-teal-600' : 'text-gray-500';

export default function IntegrationProvidersPage() {
  const [providers, setProviders] = useState<ProvidersData | null>(null);
  const [commercial, setCommercial] = useState<CommercialData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'providers' | 'commercial'>('providers');

  useEffect(() => {
    Promise.all([getIntegrationProviders(), getCommercialReadiness()])
      .then(([p, c]) => {
        setProviders(p as ProvidersData);
        setCommercial(c as CommercialData);
      })
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!providers) return <div className="p-8 text-gray-500">Loading…</div>;

  const integrationLinks = [
    { label: 'Wallet & Payments', href: '/admin/operations/integrations/wallet-payments' },
    { label: 'Checkout & Commerce', href: '/admin/operations/integrations/checkout-commerce' },
    { label: 'Ticketing', href: '/admin/operations/integrations/ticketing' },
    { label: 'Live Data', href: '/admin/operations/integrations/live-data' },
    { label: 'Sponsor Activation', href: '/admin/operations/integrations/sponsor-activation' },
    { label: 'Rewards Redemption', href: '/admin/operations/integrations/rewards-redemption' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/operations" className="hover:underline">Operations</Link> / Launch Integration Readiness
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Launch Integration Readiness</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800">
        {providers.safetyNote}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-3 bg-white text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Providers</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{providers.totalProviders}</p>
        </div>
        <div className={`border rounded-lg p-3 text-center ${providers.productionEnabledCount === 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Production Enabled</p>
          <p className={`mt-1 text-2xl font-bold ${providers.productionEnabledCount === 0 ? 'text-green-700' : 'text-red-700'}`}>
            {providers.productionEnabledCount}
          </p>
        </div>
        <div className="border border-green-200 bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Gameplay Economy</p>
          <p className="mt-1 text-sm font-bold text-green-700">POINTS-ONLY</p>
        </div>
      </div>

      {/* Integration area links */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Integration Areas</h2>
        <div className="grid grid-cols-2 gap-3">
          {integrationLinks.map((link) => (
            <Link key={link.href} href={link.href} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 text-sm font-medium text-gray-800">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['providers', 'commercial'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'providers' ? 'Provider Configs' : 'Commercial Readiness'}
          </button>
        ))}
      </div>

      {activeTab === 'providers' && (
        <div className="space-y-3">
          {providers.providers.map((p) => (
            <div key={p.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{p.displayName}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{p.providerKey}</p>
                  {p.notes && <p className="text-xs text-gray-500 mt-1">{p.notes}</p>}
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {p.requiresComplianceApproval && (
                      <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded">Compliance Required</span>
                    )}
                    {p.requiresContractApproval && (
                      <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded">Contract Required</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <div><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColour(p.status)}`}>{p.status}</span></div>
                  <p className={`text-xs font-medium ${modeColour(p.mode)}`}>{p.mode}</p>
                  <p className={`text-xs ${p.isProductionEnabled ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                    {p.isProductionEnabled ? 'PROD ENABLED' : 'prod disabled'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'commercial' && commercial && (
        <div className="space-y-4">
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-800 mb-2">Gameplay Economy</p>
            {Object.entries(commercial.gameplayEconomy).map(([k, v]) => (
              <p key={k} className="text-xs text-green-700">{k}: {v}</p>
            ))}
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-800">
            {commercial.productionStatus}
          </div>
          <div className="space-y-2">
            {Object.entries(commercial.commercialEconomy).map(([k, v]) => (
              <div key={k} className="border border-gray-200 rounded p-3 flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">{k}</span>
                <div className="text-right text-xs text-gray-500">
                  <span className={`px-2 py-0.5 rounded-full font-medium mr-2 ${statusColour(v.status)}`}>{v.status}</span>
                  {v.productionEnabled ? <span className="text-red-600 font-semibold">PROD ENABLED</span> : <span className="text-gray-400">prod disabled</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
