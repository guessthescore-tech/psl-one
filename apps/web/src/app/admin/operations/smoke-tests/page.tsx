'use client';

import { useEffect, useState } from 'react';
import {
  getSmokeTestRoutes,
  getSmokeTestRbac,
  getSmokeTestWorkflows,
  runSmokeTests,
} from '@/lib/admin-operations-client';
import Link from 'next/link';

interface SmokeTestRoute {
  route: string;
  method: string;
  domain: string;
  requiresRole: string;
  expectedStatus: number;
  notes: string[];
}

interface RbacDefinition {
  role: string;
  description: string;
  canAccess: string[];
  cannotAccess: string[];
}

interface WorkflowSummary {
  workflowKey: string;
  displayName: string;
  steps: string[];
  readinessStatus: string;
  blockers: string[];
}

interface SmokeTestResult {
  check: string;
  status: string;
  detail: string;
}

interface RunResult {
  ranAt: string;
  totalChecks: number;
  passed: number;
  warned: number;
  failed: number;
  results: SmokeTestResult[];
}

export default function SmokeTestsPage() {
  const [routes, setRoutes] = useState<SmokeTestRoute[]>([]);
  const [rbac, setRbac] = useState<RbacDefinition[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'routes' | 'rbac' | 'workflows' | 'run'>('routes');

  useEffect(() => {
    Promise.all([getSmokeTestRoutes(), getSmokeTestRbac(), getSmokeTestWorkflows()])
      .then(([r, rb, wf]) => {
        setRoutes(r as SmokeTestRoute[]);
        setRbac(rb as RbacDefinition[]);
        setWorkflows(wf as WorkflowSummary[]);
      })
      .catch((e: unknown) => setError(String(e)));
  }, []);

  async function handleRun() {
    setRunning(true);
    try {
      const result = (await runSmokeTests()) as RunResult;
      setRunResult(result);
      setActiveTab('run');
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  }

  const methodColour = (m: string) =>
    m === 'GET' ? 'bg-blue-100 text-blue-700' :
    m === 'POST' ? 'bg-green-100 text-green-700' :
    m === 'PATCH' ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';

  const workflowColour = (s: string) =>
    s === 'READY' ? 'text-green-700' :
    s === 'IN_PROGRESS' ? 'text-blue-700' :
    'text-orange-700';

  const resultColour = (s: string) =>
    s === 'PASS' ? 'bg-green-50 text-green-700' :
    s === 'WARN' ? 'bg-yellow-50 text-yellow-700' :
    'bg-red-50 text-red-700';

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  const tabs = ['routes', 'rbac', 'workflows', 'run'] as const;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">
            <Link href="/admin/operations" className="hover:underline">Operations</Link> / Smoke Tests
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Route Smoke Tests</h1>
        </div>
        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {running ? 'Running…' : 'Run Smoke Tests'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'routes' ? `Routes (${routes.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Routes tab */}
      {activeTab === 'routes' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="pb-2 pr-4">Method</th>
                <th className="pb-2 pr-4">Route</th>
                <th className="pb-2 pr-4">Domain</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="py-1.5 pr-4">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-semibold ${methodColour(r.method)}`}>
                      {r.method}
                    </span>
                  </td>
                  <td className="py-1.5 pr-4 font-mono text-xs text-gray-700">{r.route}</td>
                  <td className="py-1.5 pr-4 text-xs text-gray-500">{r.domain}</td>
                  <td className="py-1.5 pr-4 text-xs font-medium text-gray-700">{r.requiresRole}</td>
                  <td className="py-1.5 text-xs text-gray-500">{r.expectedStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RBAC tab */}
      {activeTab === 'rbac' && (
        <div className="space-y-4">
          {rbac.map((role) => (
            <div key={role.role} className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-800">{role.role}</p>
              <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-green-700 mb-1">Can Access</p>
                  <ul className="space-y-0.5">
                    {role.canAccess.map((r, i) => <li key={i} className="text-xs text-gray-600 font-mono">{r}</li>)}
                  </ul>
                </div>
                {role.cannotAccess.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-700 mb-1">Cannot Access</p>
                    <ul className="space-y-0.5">
                      {role.cannotAccess.map((r, i) => <li key={i} className="text-xs text-gray-600 font-mono">{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workflows tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          {workflows.map((wf) => (
            <div key={wf.workflowKey} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">{wf.displayName}</p>
                <span className={`text-xs font-medium ${workflowColour(wf.readinessStatus)}`}>{wf.readinessStatus}</span>
              </div>
              <ol className="mt-2 space-y-0.5">
                {wf.steps.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600">{i + 1}. {s}</li>
                ))}
              </ol>
              {wf.blockers.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {wf.blockers.map((b, i) => <li key={i} className="text-xs text-red-600">✗ {b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Run tab */}
      {activeTab === 'run' && (
        <div>
          {!runResult ? (
            <p className="text-sm text-gray-500">Click "Run Smoke Tests" to execute checks.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-6 text-sm">
                <span className="text-green-700">✓ {runResult.passed} passed</span>
                <span className="text-yellow-700">! {runResult.warned} warned</span>
                <span className="text-red-700">✗ {runResult.failed} failed</span>
              </div>
              <div className="space-y-2">
                {runResult.results.map((r, i) => (
                  <div key={i} className={`border rounded p-3 flex items-start gap-3 ${resultColour(r.status)}`}>
                    <span className="text-sm font-bold shrink-0 w-4">
                      {r.status === 'PASS' ? '✓' : r.status === 'WARN' ? '!' : '✗'}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{r.check}</p>
                      <p className="text-xs mt-0.5 opacity-80">{r.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">Ran at: {new Date(runResult.ranAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
