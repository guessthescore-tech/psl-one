import Link from 'next/link';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { PasswordForm } from '@/components/account/PasswordForm';

/**
 * /account/security — Change password + email verification status.
 * DESIGN_REVIEW_DATA only — POST /api/auth/password/change and email verify
 * endpoints are live on EC2 but not yet called from this page.
 * FantasyShell renders the DESIGN_REVIEW_DATA banner automatically.
 */
export default function AccountSecurityPage() {
  return (
    <FantasyShell
      title="Security"
      subtitle="Manage your password and account security"
      back={{ href: '/account', label: 'Account' }}
      hideFantasyTabs
    >
      {/* ── Email verification callout ── */}
      <section
        className="mb-6 rounded-card-sm border border-exp-border-dk bg-exp-ink px-4 py-4"
        aria-label="Email verification status"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-label-lg text-white mb-1">Email verification</h2>
            <p className="text-body-sm text-white/60">
              Verifying your email keeps your account secure and ensures you receive
              important notifications.
            </p>
            <p className="mt-2 text-body-sm text-exp-gold">
              Check your inbox or request a new verification link below.
            </p>
          </div>
          {/* Static indicator — server component has no JWT; show neutral state */}
          <span className="flex-shrink-0 mt-0.5 inline-flex items-center gap-1.5 text-label-md text-exp-muted border border-exp-border-dk rounded-pill px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-exp-muted" aria-hidden />
            Pending
          </span>
        </div>

        <div className="mt-4">
          <Link
            href="/account/security"
            aria-label="Request a new verification email"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-card-sm text-label-lg font-bold border border-exp-border-dk text-white hover:border-white/40 hover:bg-white/5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
          >
            Resend verification email
          </Link>
        </div>
      </section>

      {/* ── Password form ── */}
      <PasswordForm />
    </FantasyShell>
  );
}
