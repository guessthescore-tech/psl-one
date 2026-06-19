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

export const metadata: Metadata = {
  title: 'PSL One - The Digital OS of South African Football',
  description: 'Live scores, predictions, fantasy football and club news for PSL One fans.',
  metadataBase: new URL('https://pslone.co.za'),
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
        <AppHeader />
        <main id="main-content" className="pb-20 lg:pb-0">
          {children}
        </main>
        <MobileBottomNav />
      </body>
    </html>
  );
}
