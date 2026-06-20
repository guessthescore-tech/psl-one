import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Centered card layout for auth pages.
 * Renders PSL One logo/wordmark above a dark card containing the form.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-exp-void flex flex-col items-center justify-center px-4 py-12">
      {/* Logo + tagline */}
      <Link
        href="/"
        className="flex flex-col items-center gap-3 mb-8 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-4 rounded-sm"
        aria-label="PSL One — return to home"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-card-xl"
            style={{ background: 'linear-gradient(135deg,#00843d 0%,#1b3a6b 100%)' }}
            aria-hidden
          >
            <span className="text-white font-black text-base leading-none">P</span>
          </div>
          <div>
            <div>
              <span className="text-white font-black text-2xl tracking-tight">PSL</span>
              <span className="text-exp-gold font-black text-2xl tracking-tight ml-1">One</span>
            </div>
          </div>
        </div>
        <p className="text-label-md text-exp-muted text-center tracking-wide">
          The digital home of South African football
        </p>
      </Link>

      {/* Card */}
      <div className="w-full max-w-[400px] bg-exp-navy rounded-card border border-exp-border-dk shadow-card-xl p-6 sm:p-8">
        {children}
      </div>

      {/* Footer links */}
      <div className="mt-6 flex gap-4 text-xs text-exp-muted">
        <Link href="/terms" className="hover:text-white transition-colors focus-visible:outline-exp-gold focus-visible:outline-2 rounded-sm">
          Terms
        </Link>
        <Link href="/privacy" className="hover:text-white transition-colors focus-visible:outline-exp-gold focus-visible:outline-2 rounded-sm">
          Privacy
        </Link>
        <Link href="/help" className="hover:text-white transition-colors focus-visible:outline-exp-gold focus-visible:outline-2 rounded-sm">
          Help
        </Link>
      </div>
    </div>
  );
}
