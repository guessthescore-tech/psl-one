import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import '@psl-one/ui/styles';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PSL One — The Digital Home of South African Football',
  description: 'Fixtures, fantasy, predictions and rewards for every PSL fan.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
