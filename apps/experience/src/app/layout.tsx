import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppHeader } from '@/components/shell/AppHeader';
import { MobileBottomNav } from '@/components/shell/MobileBottomNav';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const isPreview = process.env['NEXT_PUBLIC_ENVIRONMENT_LABEL'] === 'vercel-preview'
  || process.env['NEXT_PUBLIC_DATA_MODE'] === 'DESIGN_REVIEW_DATA';

export const metadata: Metadata = {
  title: 'PSL One - The Digital OS of South African Football',
  description: 'Live scores, predictions, fantasy football and club news for PSL One fans.',
  metadataBase: new URL('https://pslone.co.za'),
  robots: isPreview ? { index: false, follow: false } : undefined,
  openGraph: {
    title: 'PSL One',
    description: 'The Digital OS of South African Football',
    siteName: 'PSL One',
    locale: 'en_ZA',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-exp-surface text-exp-navy antialiased">
        {/* Skip-nav for keyboard users — WCAG 2.1 AA 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-exp-gold focus:text-exp-void focus:font-bold focus:px-4 focus:py-2 focus:rounded-pill focus:outline-none"
        >
          Skip to main content
        </a>
        <AppHeader />
        <main id="main-content" className="pb-20 lg:pb-0">
          {children}
        </main>
        <MobileBottomNav />
      </body>
    </html>
  );
}
