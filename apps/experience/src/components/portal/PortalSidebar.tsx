'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 *
 * PortalSidebar — role-aware left navigation for admin, club, and sponsor portals.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '../../lib/portal-routes';

interface PortalSidebarProps {
  portalName: string;
  navItems: NavItem[];
  className?: string;
}

export function PortalSidebar({ portalName, navItems, className = '' }: PortalSidebarProps) {
  const pathname = usePathname();

  // Group items
  const groups: Record<string, NavItem[]> = {};
  for (const item of navItems) {
    const g = item.group ?? 'Other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(item);
  }

  return (
    <nav
      className={`w-56 flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col h-full ${className}`}
      aria-label={`${portalName} navigation`}
    >
      {/* Portal brand */}
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#00843d,#1b3a6b)' }}
            aria-hidden
          >
            <span className="text-white font-black text-xs">P</span>
          </div>
          <div>
            <p className="text-white font-bold text-xs leading-tight">PSL One</p>
            <p className="text-slate-500 text-xs leading-tight">{portalName}</p>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto py-3">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mb-4">
            <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              {group}
            </p>
            {items.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg mx-2 mb-0.5 transition-colors ${
                    active
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* PSL Inactive notice */}
      <div className="px-4 py-3 border-t border-slate-800">
        <p className="text-[10px] text-red-400 font-semibold uppercase">PSL Inactive</p>
        <p className="text-[10px] text-slate-600 leading-tight mt-0.5">
          WC 2026 active beta context
        </p>
      </div>
    </nav>
  );
}
