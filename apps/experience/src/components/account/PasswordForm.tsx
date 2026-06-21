'use client';

import { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react/dist/ssr';
import { clsx } from 'clsx';
import { apiPost } from '@/lib/api';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function PasswordForm() {
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fields, setFields] = useState({ current: '', new: '', confirm: '' });

  function toggleShow(field: keyof typeof show) {
    setShow(s => ({ ...s, [field]: !s[field] }));
  }

  function setField(field: keyof typeof fields, value: string) {
    setFields(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!fields.current) { setErrorMsg('Current password is required'); return; }
    if (!fields.new || fields.new.length < 8) { setErrorMsg('New password must be at least 8 characters'); return; }
    if (fields.new !== fields.confirm) { setErrorMsg('Passwords do not match'); return; }

    setFormState('loading');
    try {
      await apiPost('/auth/password/change', {
        currentPassword: fields.current,
        newPassword: fields.new,
      });
      setFormState('success');
      setFields({ current: '', new: '', confirm: '' });
    } catch (err: unknown) {
      setFormState('error');
      const msg = err instanceof Error ? err.message : 'Password change failed';
      if (msg === 'UNAUTHORIZED') {
        setErrorMsg('You must be signed in to change your password.');
      } else {
        setErrorMsg(msg);
      }
    }
  }

  if (formState === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-exp-navy-2/30 border border-exp-gold/40 rounded-card-sm p-5 text-center"
      >
        <p className="text-body-md font-bold text-exp-gold mb-2">Password changed successfully</p>
        <p className="text-body-sm text-exp-muted">Your password has been updated. Use your new password next time you sign in.</p>
        <button
          type="button"
          onClick={() => setFormState('idle')}
          className="mt-4 text-exp-gold text-label-lg underline hover:text-exp-gold-2 focus-visible:outline-2 focus-visible:outline-exp-gold rounded-sm"
        >
          Change again
        </button>
      </div>
    );
  }

  return (
    <form
      aria-label="Change password"
      className="flex flex-col gap-5"
      onSubmit={handleSubmit}
    >
      {errorMsg && (
        <div role="alert" aria-live="assertive" className="text-body-sm text-exp-live bg-exp-live/10 border border-exp-live/30 rounded-card-sm px-4 py-3">
          {errorMsg}
        </div>
      )}

      <PasswordField
        id="current-password"
        label="Current Password"
        autoComplete="current-password"
        value={fields.current}
        onChange={v => setField('current', v)}
        show={show.current}
        onToggle={() => toggleShow('current')}
        disabled={formState === 'loading'}
      />

      <PasswordField
        id="new-password"
        label="New Password"
        autoComplete="new-password"
        value={fields.new}
        onChange={v => setField('new', v)}
        show={show.new}
        onToggle={() => toggleShow('new')}
        hint="Minimum 8 characters"
        disabled={formState === 'loading'}
      />

      <PasswordField
        id="confirm-password"
        label="Confirm New Password"
        autoComplete="new-password"
        value={fields.confirm}
        onChange={v => setField('confirm', v)}
        show={show.confirm}
        onToggle={() => toggleShow('confirm')}
        disabled={formState === 'loading'}
      />

      <button
        type="submit"
        disabled={formState === 'loading'}
        aria-busy={formState === 'loading'}
        className={clsx(
          'w-full font-bold text-body-md rounded-card-sm py-3 min-h-[44px] transition-colors',
          formState === 'loading'
            ? 'bg-exp-navy-2/50 text-exp-muted cursor-not-allowed border border-exp-border-dk'
            : 'bg-exp-gold text-exp-ink hover:bg-exp-gold-2 focus-visible:outline-2 focus-visible:outline-exp-gold',
        )}
      >
        {formState === 'loading' ? 'Changing…' : 'Change Password'}
      </button>
    </form>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  hint?: string;
  disabled?: boolean;
}

function PasswordField({ id, label, autoComplete, value, onChange, show, onToggle, hint, disabled }: PasswordFieldProps) {
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
          value={value}
          onChange={e => onChange(e.target.value)}
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
