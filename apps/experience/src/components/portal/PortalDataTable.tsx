'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 *
 * PortalDataTable — generic sortable table for portal pages.
 * Pass columns and rows; handles sorting state internally.
 */

import { useState } from 'react';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
}

interface PortalDataTableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  className?: string;
}

export function PortalDataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  emptyMessage = 'No data available.',
  className = '',
}: PortalDataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(key: keyof T) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : rows;

  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-800 ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/60">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide select-none ${
                  col.sortable ? 'cursor-pointer hover:text-slate-200' : ''
                } ${col.className ?? ''}`}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                aria-sort={
                  sortKey === col.key
                    ? sortDir === 'asc' ? 'ascending' : 'descending'
                    : undefined
                }
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span aria-hidden>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <tr
                key={i}
                className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors"
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className={`px-4 py-3 text-slate-200 ${col.className ?? ''}`}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
