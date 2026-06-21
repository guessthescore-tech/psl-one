'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Warning, CheckCircle } from '@phosphor-icons/react/dist/ssr';
import { apiPost, apiFetch } from '@/lib/api';
import { getDataMode } from '@/lib/data';

type RequestStatus = {
  hasPendingRequest: boolean;
  request: { id: string; status: string; requestedAt: string; reason: string | null } | null;
};

type ViewState = 'loading' | 'idle' | 'pending' | 'confirm' | 'error';

function clsx_merge(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function DeleteAccountDialog() {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [isBusy, setIsBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [requestedAt, setRequestedAt] = useState<string | null>(null);
  const isDesignReview = getDataMode() === 'DESIGN_REVIEW_DATA';

  useEffect(() => {
    if (isDesignReview) { setViewState('idle'); return; }
    apiFetch<RequestStatus>('/account/deletion-request/status')
      .then(data => {
        if (data.hasPendingRequest && data.request) {
          setRequestedAt(data.request.requestedAt);
          setViewState('pending');
        } else {
          setViewState('idle');
        }
      })
      .catch(err => {
        const msg = err instanceof Error ? err.message : 'Failed to load status';
        if (msg === 'UNAUTHORIZED') { setViewState('idle'); }
        else { setErrorMsg(msg); setViewState('error'); }
      });
  }, [isDesignReview]);

  async function submitRequest() {
    setIsBusy(true);
    setErrorMsg(null);
    try {
      const result = await apiPost<{ requestedAt: string }>('/account/deletion-request', {});
      setRequestedAt(result.requestedAt);
      setViewState('pending');
    } catch (err: unknown) {
      setViewState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsBusy(false);
    }
  }

  async function cancelRequest() {
    setIsBusy(true);
    setErrorMsg(null);
    try {
      await apiPost('/account/deletion-request/cancel', {});
      setRequestedAt(null);
      setViewState('idle');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Cancellation failed');
    } finally {
      setIsBusy(false);
    }
  }

  if (viewState === 'loading') {
    return (
      <div aria-label="Loading account deletion status" className="flex flex-col gap-4 animate-pulse">
        <div className="h-16 bg-exp-navy-2/30 rounded-card-sm" />
        <div className="h-32 bg-exp-navy-2/30 rounded-card-sm" />
      </div>
    );
  }

  if (viewState === 'pending') {
    const formattedDate = requestedAt
      ? new Date(requestedAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'recently';
    return (
      <div className="flex flex-col gap-6">
        <div role="status" aria-live="polite" className="flex items-start gap-3 p-4 bg-exp-gold/10 border border-exp-gold/30 rounded-card-sm">
          <CheckCircle size={20} weight="fill" className="text-exp-gold flex-shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-body-md font-bold text-exp-gold">Deletion request submitted</p>
            <p className="text-body-sm text-exp-gold/80 mt-1">
              Your request was received on {formattedDate}. Our team will process it within 30 days as required by POPIA.
            </p>
          </div>
        </div>
        <RetentionNotice />
        {errorMsg && <p role="alert" className="text-body-sm text-exp-live">{errorMsg}</p>}
        <button
          type="button"
          onClick={cancelRequest}
          disabled={isBusy}
          aria-busy={isBusy}
          className="w-full bg-exp-navy-2/30 text-exp-muted font-bold text-body-md rounded-card-sm py-3 min-h-[44px] border border-exp-border-dk hover:text-white hover:border-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBusy ? 'Cancelling…' : 'Cancel Deletion Request'}
        </button>
      </div>
    );
  }

  if (viewState === 'confirm') {
    return (
      <div className="flex flex-col gap-6">
        <div role="alert" className="flex items-start gap-3 p-4 bg-exp-live/10 border border-exp-live/30 rounded-card-sm">
          <Warning size={20} weight="fill" className="text-exp-live flex-shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-body-md font-bold text-exp-live">Confirm deletion request</p>
            <p className="text-body-sm text-exp-live/80 mt-1">
              This will submit a request to delete your account. Our team will process it within 30 days.
            </p>
          </div>
        </div>
        <RetentionNotice />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setViewState('idle')}
            disabled={isBusy}
            className="flex-1 bg-exp-navy-2/30 text-exp-muted font-bold text-body-md rounded-card-sm py-3 min-h-[44px] border border-exp-border-dk hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold disabled:opacity-50"
          >
            Keep My Account
          </button>
          <button
            type="button"
            onClick={submitRequest}
            disabled={isBusy}
            aria-busy={isBusy}
            className="flex-1 bg-exp-live/20 text-exp-live font-bold text-body-md rounded-card-sm py-3 min-h-[44px] border border-exp-live/40 hover:bg-exp-live/30 transition-colors focus-visible:outline-2 focus-visible:outline-exp-live disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBusy ? 'Submitting…' : 'Confirm Request'}
          </button>
        </div>
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="flex flex-col gap-4">
        <div role="alert" className="text-body-sm text-exp-live bg-exp-live/10 border border-exp-live/30 rounded-card-sm px-4 py-3">
          {errorMsg ?? 'Something went wrong. Please try again.'}
        </div>
        <button
          type="button"
          onClick={() => { setErrorMsg(null); setViewState('idle'); }}
          className="text-exp-gold text-label-lg underline hover:text-exp-gold-2 focus-visible:outline-2 focus-visible:outline-exp-gold rounded-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  // idle state
  return (
    <div className="flex flex-col gap-6">
      {isDesignReview && (
        <div className="text-body-sm text-exp-muted bg-exp-navy-2/30 border border-exp-border-dk rounded-card-sm px-4 py-3">
          Design review mode — deletion request will not be submitted to a live API.
        </div>
      )}
      <div role="alert" className="flex items-start gap-3 p-4 bg-exp-live/10 border border-exp-live/30 rounded-card-sm">
        <Warning size={20} weight="fill" className="text-exp-live flex-shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-body-md font-bold text-exp-live">Requesting account deletion</p>
          <p className="text-body-sm text-exp-live/80 mt-1">
            This submits a formal deletion request. Your account is not removed at once — our team processes it within 30 days.
          </p>
        </div>
      </div>
      <RetentionNotice />
      <button
        type="button"
        onClick={() => isDesignReview ? undefined : setViewState('confirm')}
        disabled={isDesignReview}
        aria-disabled={isDesignReview}
        className={clsx_merge(
          'w-full font-bold text-body-md rounded-card-sm py-3 min-h-[44px] border transition-colors focus-visible:outline-2',
          isDesignReview
            ? 'bg-exp-live/20 text-exp-live/50 border-exp-live/20 cursor-not-allowed'
            : 'bg-exp-live/20 text-exp-live border-exp-live/40 hover:bg-exp-live/30 focus-visible:outline-exp-live',
        )}
      >
        {isDesignReview ? 'Request Deletion (design review only)' : 'Request Account Deletion'}
      </button>
    </div>
  );
}

function RetentionNotice() {
  return (
    <div className="bg-exp-navy-2/20 border border-exp-border-dk rounded-card-sm p-4 flex flex-col gap-3">
      <p className="text-label-lg text-exp-muted uppercase tracking-wider">What happens to your data</p>
      <ul className="flex flex-col gap-2" role="list">
        {[
          'Your request will be processed within 30 days as required by POPIA',
          'You may cancel your request at any time before it is processed',
          'Personal data including profile, predictions, and fantasy records will be removed',
          'Financial audit records and legal compliance logs are retained as required by law',
          'Points ledger records may be retained in anonymised form for platform integrity',
        ].map(item => (
          <li key={item} className="flex items-start gap-2 text-body-sm text-exp-muted">
            <span className="text-exp-muted/50 mt-0.5 flex-shrink-0" aria-hidden>–</span>
            {item}
          </li>
        ))}
      </ul>
      <div className="border-t border-exp-border-dk pt-3">
        <p className="text-body-sm text-exp-muted leading-relaxed">
          Your rights are protected under the{' '}
          <strong className="text-white">Protection of Personal Information Act (POPIA)</strong>.
          See our{' '}
          <Link
            href="/privacy"
            className="text-exp-gold underline hover:text-exp-gold-2 focus-visible:outline-2 focus-visible:outline-exp-gold rounded-sm"
          >
            Privacy Policy
          </Link>
          {' '}for details.
        </p>
      </div>
    </div>
  );
}
