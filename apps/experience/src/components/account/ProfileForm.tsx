'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

interface ProfileFormValues {
  displayName: string;
  bio: string;
  phone: string;
}

interface ProfileFormProps {
  initialValues?: Partial<ProfileFormValues>;
  onSave: (values: ProfileFormValues) => Promise<void>;
}

/**
 * Profile edit form: display name, bio, phone number.
 */
export function ProfileForm({ initialValues, onSave }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>({
    displayName: initialValues?.displayName ?? '',
    bio: initialValues?.bio ?? '',
    phone: initialValues?.phone ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bioRemaining = 160 - values.bio.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.displayName.trim()) {
      setError('Display name is required');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await onSave(values);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Edit profile" className="flex flex-col gap-5">
      {/* Display Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-label-lg text-exp-muted uppercase tracking-wider">
          Display Name <span aria-hidden className="text-exp-live">*</span>
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={30}
          value={values.displayName}
          onChange={e => setValues(v => ({ ...v, displayName: e.target.value }))}
          placeholder="Your name"
          className={clsx(
            'w-full bg-exp-ink border rounded-card-sm px-4 py-3 text-white text-body-md placeholder:text-exp-muted/50 transition-colors min-h-[44px]',
            'focus:outline-none focus:border-exp-gold',
            'border-exp-border-dk',
          )}
          aria-required
        />
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-label-lg text-exp-muted uppercase tracking-wider">
          Bio <span className="text-exp-muted/50 font-normal normal-case">(optional)</span>
        </label>
        <textarea
          id="bio"
          rows={3}
          maxLength={160}
          value={values.bio}
          onChange={e => setValues(v => ({ ...v, bio: e.target.value }))}
          placeholder="Tell other fans about yourself…"
          className={clsx(
            'w-full bg-exp-ink border rounded-card-sm px-4 py-3 text-white text-body-md placeholder:text-exp-muted/50 transition-colors resize-none',
            'focus:outline-none focus:border-exp-gold',
            'border-exp-border-dk',
          )}
        />
        <span className={clsx('text-label-sm self-end', bioRemaining < 20 ? 'text-exp-warning' : 'text-exp-muted')}>
          {bioRemaining} remaining
        </span>
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-label-lg text-exp-muted uppercase tracking-wider">
          Phone <span className="text-exp-muted/50 font-normal normal-case">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={e => setValues(v => ({ ...v, phone: e.target.value }))}
          placeholder="+27 …"
          className={clsx(
            'w-full bg-exp-ink border rounded-card-sm px-4 py-3 text-white text-body-md placeholder:text-exp-muted/50 transition-colors min-h-[44px]',
            'focus:outline-none focus:border-exp-gold',
            'border-exp-border-dk',
          )}
        />
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="text-body-sm text-exp-live bg-exp-live/10 rounded-card-xs px-3 py-2">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div role="status" className="text-body-sm text-exp-success bg-exp-success/10 rounded-card-xs px-3 py-2">
          Profile updated
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        aria-busy={saving}
        className={clsx(
          'w-full bg-exp-green text-white font-bold text-body-md rounded-card-sm py-3 min-h-[44px] transition-opacity',
          'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
          saving ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90',
        )}
      >
        {saving ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  );
}
