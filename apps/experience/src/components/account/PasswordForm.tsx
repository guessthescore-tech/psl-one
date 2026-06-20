'use client';

import { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react/dist/ssr';
import { clsx } from 'clsx';

/**
 * Change password form: current + new + confirm.
 * Currently disabled — backend API not yet implemented.
 */
export function PasswordForm() {
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  function toggleShow(field: keyof typeof show) {
    setShow(s => ({ ...s, [field]: !s[field] }));
  }

  return (
    <form
      aria-label="Change password"
      className="flex flex-col gap-5"
      onSubmit={e => e.preventDefault()}
    >
      {/* Info banner */}
      <div
        role="note"
        className="text-body-sm text-exp-muted bg-exp-navy-2/30 border border-exp-border-dk rounded-card-sm px-4 py-3"
      >
        In-session password change requires a backend API that is not yet implemented.
        Use{' '}
        <a href="/forgot-password" className="text-exp-gold underline hover:text-exp-gold-2 focus-visible:outline-2 focus-visible:outline-exp-gold rounded-sm">
          Forgot Password
        </a>{' '}
        from the sign-in page to reset your password.
      </div>

      {/* Current password */}
      <PasswordField
        id="current-password"
        label="Current Password"
        autoComplete="current-password"
        show={show.current}
        onToggle={() => toggleShow('current')}
        disabled
      />

      {/* New password */}
      <PasswordField
        id="new-password"
        label="New Password"
        autoComplete="new-password"
        show={show.new}
        onToggle={() => toggleShow('new')}
        hint="Minimum 8 characters"
        disabled
      />

      {/* Confirm password */}
      <PasswordField
        id="confirm-password"
        label="Confirm New Password"
        autoComplete="new-password"
        show={show.confirm}
        onToggle={() => toggleShow('confirm')}
        disabled
      />

      {/* Disabled submit */}
      <button
        type="button"
        disabled
        title="Requires backend API — coming soon"
        aria-disabled="true"
        aria-describedby="coming-soon-note"
        className="w-full bg-exp-navy-2/50 text-exp-muted font-bold text-body-md rounded-card-sm py-3 min-h-[44px] cursor-not-allowed border border-exp-border-dk"
      >
        Change Password
      </button>
      <p id="coming-soon-note" className="text-label-sm text-exp-muted text-center">
        Coming soon — use "Forgot Password" in the meantime
      </p>
    </form>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  autoComplete: string;
  show: boolean;
  onToggle: () => void;
  hint?: string;
  disabled?: boolean;
}

function PasswordField({ id, label, autoComplete, show, onToggle, hint, disabled }: PasswordFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label-lg text-exp-muted uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder="••••••••"
          className={clsx(
            'w-full bg-exp-ink border border-exp-border-dk rounded-card-sm px-4 py-3 pr-12 text-white text-body-md placeholder:text-exp-muted/30 transition-colors min-h-[44px]',
            'focus:outline-none focus:border-exp-gold',
            disabled && 'opacity-40 cursor-not-allowed',
          )}
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-exp-muted hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {show ? <EyeSlash size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </div>
      {hint && <p className="text-label-sm text-exp-muted">{hint}</p>}
    </div>
  );
}
