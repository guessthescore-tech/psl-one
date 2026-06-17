'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { PrimaryNav } from './PrimaryNav';
import { MobileBottomNav } from './MobileBottomNav';

interface NavWrapperProps {
  children: ReactNode;
}

/**
 * Wraps page content with the global nav system.
 * Excluded on /design-lab/** routes (they have their own internal navigation).
 */
export function NavWrapper({ children }: NavWrapperProps) {
  const pathname = usePathname();
  const isDesignLab = pathname?.startsWith('/design-lab') ?? false;

  if (isDesignLab) {
    return <>{children}</>;
  }

  return (
    <>
      <PrimaryNav />
      {/* Bottom padding on mobile to clear the fixed MobileBottomNav */}
      <div className="pb-14 md:pb-0">
        {children}
      </div>
      <MobileBottomNav />
    </>
  );
}
