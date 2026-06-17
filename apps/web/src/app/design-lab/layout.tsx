export const metadata = {
  title: 'PSL One — Design Lab',
  robots: { index: false, follow: false },
};

export default function DesignLabLayout({ children }: { children: React.ReactNode }) {
  const enabled = process.env['NEXT_PUBLIC_DESIGN_LAB_ENABLED'] === 'true';

  if (!enabled) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <div className="text-6xl font-black text-gray-200 mb-4">404</div>
          <h1 className="text-xl font-bold text-gray-700 mb-2">Design Lab Disabled</h1>
          <p className="text-sm text-gray-500 mb-6">
            Set <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_DESIGN_LAB_ENABLED=true</code> to enable this area.
          </p>
          <a href="/" className="text-sm text-psl-navy hover:underline">Back to home</a>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
