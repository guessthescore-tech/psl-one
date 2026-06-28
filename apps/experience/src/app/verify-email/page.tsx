import Link from 'next/link';
import { CheckCircle, Warning, XCircle } from '@phosphor-icons/react/dist/ssr';
import { getServerApiBase } from '@/lib/server-api-base';

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

const API_BASE = getServerApiBase();

type VerifyResult =
  | { status: 'success' }
  | { status: 'expired' }
  | { status: 'no_token' }
  | { status: 'error'; message: string };

async function verifyToken(token: string): Promise<VerifyResult> {
  try {
    const res = await fetch(`${API_BASE}/auth/email/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });

    if (res.ok) return { status: 'success' };
    if (res.status === 400 || res.status === 410) return { status: 'expired' };
    return { status: 'error', message: `Unexpected response (${res.status})` };
  } catch {
    return { status: 'error', message: 'Unable to reach verification server.' };
  }
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = params.token;

  let result: VerifyResult;
  if (!token) {
    result = { status: 'no_token' };
  } else {
    result = await verifyToken(token);
  }

  return (
    <div className="min-h-[100dvh] bg-exp-void flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px] bg-exp-navy rounded-card border border-exp-border-dk shadow-card-xl p-8 flex flex-col items-center gap-6 text-center">
        {result.status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-exp-green/15 flex items-center justify-center">
              <CheckCircle size={36} weight="fill" className="text-exp-green" aria-hidden />
            </div>
            <div>
              <h1 className="text-display-sm text-white mb-2">Email verified!</h1>
              <p className="text-body-md text-white/70">
                Your account is now active. You can sign in and start enjoying PSL One.
              </p>
            </div>
            <Link
              href="/sign-in"
              className="w-full py-3.5 rounded-card-sm text-label-lg font-bold bg-exp-gold text-exp-void hover:bg-exp-gold-2 transition-colors duration-150 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px] flex items-center justify-center"
            >
              Sign in to PSL One
            </Link>
          </>
        )}

        {result.status === 'expired' && (
          <>
            <div className="w-16 h-16 rounded-full bg-exp-live/15 flex items-center justify-center">
              <Warning size={36} weight="fill" className="text-exp-live" aria-hidden />
            </div>
            <div>
              <h1 className="text-display-sm text-white mb-2">Link expired</h1>
              <p className="text-body-md text-white/70">
                This verification link has expired or has already been used. You can request
                a new one from your account security settings.
              </p>
            </div>
            <Link
              href="/account/security"
              className="w-full py-3.5 rounded-card-sm text-label-lg font-bold border border-exp-border-dk text-white hover:border-white/40 transition-colors duration-150 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px] flex items-center justify-center"
            >
              Go to account security
            </Link>
          </>
        )}

        {result.status === 'no_token' && (
          <>
            <div className="w-16 h-16 rounded-full bg-exp-live/15 flex items-center justify-center">
              <XCircle size={36} weight="fill" className="text-exp-live" aria-hidden />
            </div>
            <div>
              <h1 className="text-display-sm text-white mb-2">Invalid link</h1>
              <p className="text-body-md text-white/70">
                This verification link is invalid. Please use the link sent to your email,
                or request a new verification email.
              </p>
            </div>
            <Link
              href="/sign-in"
              className="w-full py-3.5 rounded-card-sm text-label-lg font-bold border border-exp-border-dk text-white hover:border-white/40 transition-colors duration-150 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px] flex items-center justify-center"
            >
              Back to sign in
            </Link>
          </>
        )}

        {result.status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-exp-live/15 flex items-center justify-center">
              <XCircle size={36} weight="fill" className="text-exp-live" aria-hidden />
            </div>
            <div>
              <h1 className="text-display-sm text-white mb-2">Verification failed</h1>
              <p className="text-body-md text-white/70">
                {'message' in result ? result.message : 'Something went wrong. Please try again later.'}
              </p>
            </div>
            <Link
              href="/sign-in"
              className="w-full py-3.5 rounded-card-sm text-label-lg font-bold border border-exp-border-dk text-white hover:border-white/40 transition-colors duration-150 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px] flex items-center justify-center"
            >
              Back to sign in
            </Link>
          </>
        )}

        {/* Footer link */}
        <p className="text-body-sm text-exp-muted">
          Need help?{' '}
          <Link href="/help" className="text-exp-gold hover:underline">
            Visit our help centre
          </Link>
        </p>
      </div>
    </div>
  );
}
