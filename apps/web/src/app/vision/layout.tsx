export const metadata = {
  title: 'PSL One — Vision Studio',
  robots: { index: false, follow: false },
};

export default function VisionLayout({ children }: { children: React.ReactNode }) {
  const enabled = process.env['NEXT_PUBLIC_VISION_STUDIO_ENABLED'] === 'true';

  if (!enabled) {
    return (
      <main className="min-h-screen bg-psl-midnight flex items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <div className="text-6xl font-black text-white/10 mb-4">404</div>
          <h1 className="text-xl font-bold text-white mb-2">Vision Studio Disabled</h1>
          <p className="text-sm text-white/50 mb-6">
            Set{' '}
            <code className="bg-white/10 px-1.5 py-0.5 rounded text-psl-gold text-xs">
              NEXT_PUBLIC_VISION_STUDIO_ENABLED=true
            </code>{' '}
            to enable this area.
          </p>
          <a href="/" className="text-sm text-psl-gold hover:underline">
            Back to home
          </a>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
