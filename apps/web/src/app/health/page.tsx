import { apiUrl } from '@/lib/api';
import Link from 'next/link';

interface ApiHealth {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

async function fetchApiHealth(): Promise<ApiHealth | null> {
  try {
    const res = await fetch(apiUrl('/health'), {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<ApiHealth>;
  } catch {
    return null;
  }
}

export const dynamic = 'force-dynamic';

export default async function HealthPage() {
  const health = await fetchApiHealth();
  const isUp = health?.status === 'ok';

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link href="/" className="text-sm text-[#1b3a6b] hover:underline">
            ← Back
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-[#1b3a6b]">System Health</h1>
        <div
          className={`mt-6 rounded-lg border p-6 ${
            isUp ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${isUp ? 'bg-green-500' : 'bg-red-400'}`}
            />
            <span
              className={`font-semibold ${isUp ? 'text-green-700' : 'text-red-700'}`}
            >
              API — {isUp ? 'Healthy' : 'Unreachable'}
            </span>
          </div>
          {health && (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="w-20 text-gray-500">Service</dt>
                <dd className="text-gray-900">{health.service}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 text-gray-500">Version</dt>
                <dd className="text-gray-900">{health.version}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 text-gray-500">Checked</dt>
                <dd className="text-gray-900">
                  {new Date(health.timestamp).toLocaleString('en-ZA')}
                </dd>
              </div>
            </dl>
          )}
          {!health && (
            <p className="mt-3 text-sm text-red-600">
              API not reachable. Start it with: <code className="font-mono">pnpm dev</code>
            </p>
          )}
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Endpoint: {apiUrl('/health')}
        </p>
      </div>
    </main>
  );
}
