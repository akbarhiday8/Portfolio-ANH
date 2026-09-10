import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://akbar-nur-portfolio.akbar8nur.chatgpt.site'),
  title: 'Akbar Nur Hidayanto — Portofolio Pribadi',
  description: 'Portofolio profesional Akbar Nur Hidayanto: karya, perjalanan belajar, sertifikasi, dan proyek pilihan.',
  openGraph: {
    title: 'Akbar Nur Hidayanto — Portofolio Pribadi',
    description: 'Karya · Pembelajaran · Kreasi — arsip profesional pribadi Akbar Nur Hidayanto.',
    type: 'website',
    images: [{ url: '/og.png', width: 1732, height: 910, alt: 'Akbar Nur Hidayanto — Portofolio Pribadi' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Akbar Nur Hidayanto — Portofolio Pribadi',
    description: 'Karya · Pembelajaran · Kreasi — arsip profesional pribadi Akbar Nur Hidayanto.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var saved=localStorage.getItem('anh-theme');var theme=saved||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}catch(e){document.documentElement.dataset.theme='light';}})();`,
          }}
        />
      </head>
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
