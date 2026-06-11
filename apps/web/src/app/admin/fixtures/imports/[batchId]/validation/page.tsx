'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ValidationItem {
  severity: string;
  field?: string;
  message: string;
}

interface RowResult {
  rowId: string;
  rowNumber: number;
  status: string;
  errors: ValidationItem[];
  warnings: ValidationItem[];
}

interface ValidationSummary {
  batchId: string;
  status: string;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  canCommit: boolean;
  rowResults: RowResult[];
}

export default function BatchValidationPage() {
  const params = useParams<{ batchId: string }>();
  const batchId = params.batchId;
  const [result, setResult] = useState<ValidationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runValidation() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/fixtures/admin/imports/${batchId}/validate`, {
        method: 'POST', credentials: 'include',
      });
      if (!res.ok) { const b = await res.text(); throw new Error(`${res.status}: ${b}`); }
      const data = await res.json() as ValidationSummary;
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void runValidation(); }, [batchId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/admin/fixtures/imports/${batchId}`} className="text-sm text-blue-600 hover:underline">
          ← Batch Detail
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Batch Validation</h1>
      </div>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4">{error}</p>}

      {loading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Validating rows…</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total', value: result.totalRows, colour: 'text-gray-700' },
              { label: 'Valid', value: result.validRows, colour: 'text-green-600' },
              { label: 'Warnings', value: result.warningRows, colour: 'text-yellow-600' },
              { label: 'Errors', value: result.errorRows, colour: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="border rounded-lg p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.colour}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className={`rounded-lg p-4 mb-6 ${result.canCommit ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {result.canCommit ? (
              <p className="text-green-700 font-medium">
                Batch is valid and ready to commit. {result.warningRows > 0 && `(${result.warningRows} warning(s) — review before committing)`}
              </p>
            ) : (
              <p className="text-red-700 font-medium">
                {result.errorRows} error(s) must be fixed before committing.
              </p>
            )}
          </div>

          <div className="flex gap-3 mb-6">
            <button onClick={() => void runValidation()} disabled={loading} className="border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Re-validate
            </button>
            {result.canCommit && (
              <Link
                href={`/admin/fixtures/imports/${batchId}`}
                className="bg-purple-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-purple-700"
              >
                Go to Commit
              </Link>
            )}
          </div>

          {result.rowResults.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-800 mb-3">Row Results</h2>
              <div className="space-y-2">
                {result.rowResults
                  .filter(r => r.errors.length > 0 || r.warnings.length > 0)
                  .map(r => (
                    <div key={r.rowId} className={`border rounded-lg p-3 ${r.errors.length > 0 ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
                      <p className="text-sm font-medium mb-2">Row {r.rowNumber}</p>
                      {r.errors.map((e, i) => (
                        <p key={i} className="text-xs text-red-700">
                          <span className="font-medium">[ERROR{e.field ? ` – ${e.field}` : ''}]</span> {e.message}
                        </p>
                      ))}
                      {r.warnings.map((w, i) => (
                        <p key={i} className="text-xs text-yellow-700">
                          <span className="font-medium">[WARN{w.field ? ` – ${w.field}` : ''}]</span> {w.message}
                        </p>
                      ))}
                    </div>
                  ))}
                {result.rowResults.every(r => r.errors.length === 0 && r.warnings.length === 0) && (
                  <p className="text-green-600 text-sm">All rows are valid with no issues.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
