'use client';

import { useEffect, useState } from 'react';
import { adminGetSmokeTests, adminRunSmokeTests } from '@/lib/beta-launch-client';

interface SmokeTestItem {
  id: string;
  area: string;
  route: string;
  method: string;
  expectedStatus: number;
  actualStatus: number | null;
  status: string;
  destructive: boolean;
  notes: string[];
}

interface SmokeTestData {
  totalTests: number;
  areas: string[];
  activationRouteAbsent: boolean;
  destructiveRoutesAbsent: boolean;
  allNonDestructive: boolean;
  registry: SmokeTestItem[];
  note: string;
}

export default function AdminSmokeTestsPage() {
  const [data, setData] = useState<SmokeTestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    adminGetSmokeTests().then(d => setData(d as SmokeTestData)).catch(e => setError(String(e)));
  };

  useEffect(() => { load(); }, []);

  const run = async () => {
    setRunning(true);
    setMsg(null);
    try {
      const result = await adminRunSmokeTests() as { ran: number };
      setMsg(`Smoke test registry queued — ${result.ran} tests registered (descriptive audit only)`);
      load();
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  };

  const statusChip = (s: string) => {
    const cls =
      s === 'PASS' ? 'bg-green-100 text-green-800' :
      s === 'FAIL' ? 'bg-red-100 text-red-800' :
      s === 'WARNING' ? 'bg-amber-100 text-amber-800' :
      'bg-gray-100 text-gray-600';
    return <span className={`text-xs px-2 py-0.5 rounded font-mono ${cls}`}>{s}</span>;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Beta Launch Smoke Tests</h1>
        <p className="text-sm text-gray-500 mt-1">24-item registry — no activation routes — all non-destructive</p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {msg && <p className="text-green-700 text-sm">{msg}</p>}

      <button
        onClick={run}
        disabled={running}
        className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {running ? 'Running…' : 'Run Smoke Tests (descriptive audit)'}
      </button>

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="border rounded p-3">
              <p className="text-gray-500 text-xs">Total tests</p>
              <p className="font-bold text-xl">{data.totalTests}</p>
            </div>
            <div className="border rounded p-3">
              <p className="text-gray-500 text-xs">Unique areas</p>
              <p className="font-bold text-xl">{data.areas.length}</p>
            </div>
            <div className={`border rounded p-3 ${data.activationRouteAbsent ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-xs text-gray-500">No activation route</p>
              <p className="font-semibold">{data.activationRouteAbsent ? 'Confirmed' : 'VIOLATION'}</p>
            </div>
            <div className={`border rounded p-3 ${data.allNonDestructive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-xs text-gray-500">All non-destructive</p>
              <p className="font-semibold">{data.allNonDestructive ? 'Confirmed' : 'VIOLATION'}</p>
            </div>
          </div>

          <p className="text-xs text-gray-500">{data.note}</p>

          <div className="space-y-1">
            {data.registry.map(item => (
              <div key={item.id} className="border rounded p-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.area}</p>
                  <p className="text-xs font-mono text-gray-500 truncate">{item.method} {item.route}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">{item.expectedStatus}</span>
                  {statusChip(item.status)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
