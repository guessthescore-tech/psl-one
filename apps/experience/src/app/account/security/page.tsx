import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { PasswordForm } from '@/components/account/PasswordForm';
import { EmailVerificationPanel } from '@/components/account/EmailVerificationPanel';

/**
 * /account/security — Change password + email verification status.
 */
export default function AccountSecurityPage() {
  return (
    <FantasyShell
      title="Security"
      subtitle="Manage your password and account security"
      back={{ href: '/account', label: 'Account' }}
      hideFantasyTabs
    >
      <EmailVerificationPanel />

      {/* ── Password form ── */}
      <PasswordForm />
    </FantasyShell>
  );
}
