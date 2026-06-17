import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { NavWrapper } from '@/components/navigation/NavWrapper';
import '@psl-one/ui/styles';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PSL One — The Digital Home of South African Football',
  description: 'Fixtures, fantasy, predictions and rewards for every PSL fan.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <NavWrapper>{children}</NavWrapper>
        </Providers>
      </body>
    </html>
  );
}
