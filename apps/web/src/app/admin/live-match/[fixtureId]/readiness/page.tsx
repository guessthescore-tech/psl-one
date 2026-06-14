'use client';

import { use, useEffect, useState } from 'react';
import { footballClient } from '@/lib/football-client';
import { adminGetCapabilityStatus } from '@/lib/admin-match-centre-client';

interface CapabilityStatus {
  provider?: string;
  connected?: boolean;
  capabilities?: Record<string, boolean>;
  stubMode?: boolean;
}

export default function AdminLiveMatchReadinessPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [availability, setAvailability] = useState<unknown[]>([]);
  const [capability, setCapability] = useState<CapabilityStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      footballClient.getFixtureAvailability(fixtureId),
      adminGetCapabilityStatus() as Promise<CapabilityStatus>,
    ]).then(([avail, cap]) => {
      setAvailability(avail);
      setCapability(cap);
    }).finally(() => setLoading(false));
  }, [fixtureId]);

  interface AvailabilityItem { playerId: string; status: string; player?: { name: string; position?: string | null }; team?: { shortName: string } }
  const items = availability as AvailabilityItem[];

  const available = items.filter(a => a.status === 'STARTING' || a.status === 'SUBSTITUTE');
  const unavailable = items.filter(a => a.status !== 'STARTING' && a.status !== 'SUBSTITUTE');

  return (
    <main className="max-w-3xl mx-auto p-6">
      <a href={`/admin/live-match/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Fixture Overview</a>
      <h1 className="text-2xl font-bold mb-6">Match Readiness</h1>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}

      {capability && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-2">Provider Status</h2>
          <div className="border rounded-xl p-4 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${capability.connected ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className="text-sm font-medium">{capability.provider ?? 'Sandbox'}</span>
              {capability.stubMode && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">STUB MODE</span>}
            </div>
            {capability.capabilities && (
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(capability.capabilities).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-xs">
                    <span className={v ? 'text-green-600' : 'text-gray-300'}>●</span>
                    <span className="text-gray-600 capitalize">{k.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-gray-600 mb-2">
          Player Availability ({available.length} available · {unavailable.length} unavailable)
        </h2>
        <div className="space-y-1">
          {items.map(a => (
            <div key={a.playerId} className="flex items-center justify-between text-xs border-b py-1.5">
              <div>
                <span className="font-medium">{a.player?.name ?? a.playerId}</span>
                <span className="text-gray-400 ml-2">{a.team?.shortName} · {a.player?.position}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                a.status === 'STARTING' ? 'bg-green-100 text-green-700' :
                a.status === 'SUBSTITUTE' ? 'bg-blue-100 text-blue-700' :
                'bg-red-50 text-red-500'
              }`}>{a.status}</span>
            </div>
          ))}
          {!loading && items.length === 0 && <p className="text-gray-400 text-sm">No availability data yet.</p>}
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white border rounded-xl p-3">
          <div className="text-2xl font-bold text-green-600">{available.length}</div>
          <div className="text-xs text-gray-500">Available</div>
        </div>
        <div className="bg-white border rounded-xl p-3">
          <div className="text-2xl font-bold text-red-500">{unavailable.length}</div>
          <div className="text-xs text-gray-500">Unavailable</div>
        </div>
        <div className="bg-white border rounded-xl p-3">
          <div className="text-2xl font-bold">{items.length}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>
    </main>
  );
}
