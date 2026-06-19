import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { DeleteAccountDialog } from '@/components/account/DeleteAccountDialog';

/**
 * /account/delete — Delete account
 * DESIGN_REVIEW_DATA only — POPIA compliance endpoint not yet built.
 * Non-functional with clear user messaging.
 */
export default function DeleteAccountPage() {
  return (
    <FantasyShell
      title="Delete Account"
      subtitle="Permanently remove your PSL One account"
      back={{ href: '/account', label: 'Account' }}
    >
      <DeleteAccountDialog />
    </FantasyShell>
  );
}
