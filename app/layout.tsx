import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://akbar-nur-portfolio.leafy-koala-9715.chatgpt.site'),
  title: 'Akbar Nur — Personal Portfolio',
  description: 'The personal professional archive of Akbar Nur: work, learning, certifications, and selected projects.',
  openGraph: {
    title: 'Akbar Nur — Personal Portfolio',
    description: 'Work · Learning · Creation — the personal professional archive of Akbar Nur.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Akbar Nur — Personal Portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Akbar Nur — Personal Portfolio',
    description: 'Work · Learning · Creation — the personal professional archive of Akbar Nur.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
