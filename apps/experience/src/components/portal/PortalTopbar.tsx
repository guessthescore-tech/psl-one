'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 *
 * PortalTopbar — breadcrumbs + user menu + search placeholder.
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface PortalTopbarProps {
  portalName?: string;
}

function buildBreadcrumbs(pathname: string | null): { label: string; href: string }[] {
  if (!pathname) return [];
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let href = '';
  for (const part of parts) {
    href += `/${part}`;
    crumbs.push({
      label: part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      href,
    });
  }
  return crumbs;
}

export function PortalTopbar({ portalName }: PortalTopbarProps) {
  const pathname = usePathname();
  const crumbs = buildBreadcrumbs(pathname);
  const [search, setSearch] = useState('');

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center px-4 gap-4 flex-shrink-0">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <span className="text-slate-700 flex-shrink-0">/</span>}
            {i === crumbs.length - 1 ? (
              <span className="text-slate-200 font-medium truncate" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-slate-500 hover:text-slate-300 truncate transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Search placeholder */}
      <div className="flex-shrink-0">
        <input
          type="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48 px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 transition-colors"
          aria-label="Search portal"
        />
      </div>

      {/* User menu placeholder */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {portalName && (
          <span className="text-xs text-slate-500 hidden sm:block">{portalName}</span>
        )}
        <div
          className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-600 transition-colors"
          role="button"
          tabIndex={0}
          aria-label="User menu"
        >
          U
        </div>
      </div>
    </header>
  );
}
