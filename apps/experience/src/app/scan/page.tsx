import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { BadgeScannerShell } from '@/components/account/BadgeScannerShell';

/**
 * /scan — Badge scanner shell
 * DESIGN_REVIEW_DATA only. No real camera access.
 * NFC and QR badge scanning requires hardware integration — future work.
 */
export default function ScanPage() {
  return (
    <FantasyShell
      title="Scan a Badge"
      subtitle="Earn Fan Points at PSL events"
    >
      <BadgeScannerShell />
    </FantasyShell>
  );
}
