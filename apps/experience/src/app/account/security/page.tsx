import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { PasswordForm } from '@/components/account/PasswordForm';

/**
 * /account/security — Change password
 * DESIGN_REVIEW_DATA only — POST /api/auth/password/change not yet implemented.
 * FantasyShell renders the DESIGN_REVIEW_DATA banner automatically.
 */
export default function AccountSecurityPage() {
  return (
    <FantasyShell
      title="Security"
      subtitle="Manage your password and account security"
      back={{ href: '/account', label: 'Account' }}
    >
      <PasswordForm />
    </FantasyShell>
  );
}
