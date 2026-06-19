import Link from 'next/link';
import { Warning } from '@phosphor-icons/react/dist/ssr';

/**
 * Destructive action component for account deletion.
 * Non-functional — POPIA compliance endpoint not yet built.
 * Clearly communicates what deletion does and links to privacy policy.
 */
export function DeleteAccountDialog() {
  return (
    <div className="flex flex-col gap-6">
      {/* Warning banner */}
      <div
        role="alert"
        className="flex items-start gap-3 p-4 bg-exp-live/10 border border-exp-live/30 rounded-card-sm"
      >
        <Warning size={20} weight="fill" className="text-exp-live flex-shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-body-md font-bold text-exp-live">This action cannot be undone</p>
          <p className="text-body-sm text-exp-live/80 mt-1">
            Permanently deleting your account removes all your data from PSL One.
          </p>
        </div>
      </div>

      {/* What deletion does */}
      <div className="bg-exp-ink border border-exp-border-dk rounded-card-sm p-4">
        <p className="text-label-lg text-exp-muted uppercase tracking-wider mb-3">
          Deletion will:
        </p>
        <ul className="flex flex-col gap-2" role="list">
          {[
            'Remove all personal data from PSL One systems',
            'Delete your fantasy teams and transfer history',
            'Cancel all notifications and alerts',
            'Remove your prediction and leaderboard records',
            'Delete your achievements, badges, and fan value balance',
            'Unlink your account from all social features',
          ].map(item => (
            <li key={item} className="flex items-start gap-2 text-body-sm text-exp-muted">
              <span className="text-exp-live mt-0.5 flex-shrink-0" aria-hidden>×</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* POPIA info */}
      <div className="bg-exp-navy-2/20 border border-exp-border-dk rounded-card-sm p-4">
        <p className="text-body-sm text-exp-muted leading-relaxed">
          Account deletion requires identity verification and complies with the{' '}
          <strong className="text-white">
            Protection of Personal Information Act (POPIA)
          </strong>
          . This feature will be available in a future release.
        </p>
        <p className="text-body-sm text-exp-muted mt-2">
          You have the right to access, correct, and delete your personal data under POPIA.
          See our{' '}
          <Link
            href="/privacy"
            className="text-exp-gold underline hover:text-exp-gold-2 focus-visible:outline-2 focus-visible:outline-exp-gold rounded-sm"
          >
            Privacy Policy
          </Link>{' '}
          for details, or contact our Data Protection Officer.
        </p>
      </div>

      {/* Disabled button */}
      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-describedby="delete-coming-soon"
        className="w-full bg-exp-live/20 text-exp-live/50 font-bold text-body-md rounded-card-sm py-3 min-h-[44px] cursor-not-allowed border border-exp-live/20"
      >
        Delete My Account
      </button>
      <p id="delete-coming-soon" className="text-label-sm text-exp-muted text-center">
        Account deletion requires POPIA verification — coming in a future release
      </p>
    </div>
  );
}
