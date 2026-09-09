import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://akbar-nur-portfolio.leafy-koala-9715.chatgpt.site'),
  title: 'Akbar Nur — Portofolio Pribadi',
  description: 'Portofolio profesional Akbar Nur: karya, perjalanan belajar, sertifikasi, dan proyek pilihan.',
  openGraph: {
    title: 'Akbar Nur — Portofolio Pribadi',
    description: 'Karya · Pembelajaran · Kreasi — arsip profesional pribadi Akbar Nur.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Akbar Nur — Portofolio Pribadi' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Akbar Nur — Portofolio Pribadi',
    description: 'Karya · Pembelajaran · Kreasi — arsip profesional pribadi Akbar Nur.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
