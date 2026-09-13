import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { resolveBranding } from '@/lib/branding';
import { getPortfolioContent } from '@/lib/cms-repository';
import { SITE_URL } from '@/lib/site-url';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Akbar Nur Hidayanto — Portofolio Pribadi',
  description: 'Portofolio profesional Akbar Nur Hidayanto: karya, perjalanan belajar, sertifikasi, dan proyek pilihan.',
  openGraph: {
    title: 'Akbar Nur Hidayanto — Portofolio Pribadi',
    description: 'Karya · Pembelajaran · Kreasi — arsip profesional pribadi Akbar Nur Hidayanto.',
    type: 'website',
    images: [{ url: '/og.jpg', width: 1732, height: 908, alt: 'Akbar Nur Hidayanto — Portofolio Pribadi' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Akbar Nur Hidayanto — Portofolio Pribadi',
    description: 'Karya · Pembelajaran · Kreasi — arsip profesional pribadi Akbar Nur Hidayanto.',
    images: ['/og.jpg'],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { profile, siteContent } = await getPortfolioContent();
    const branding = resolveBranding(siteContent, profile);
    return {
      ...baseMetadata,
      icons: branding.favicon
        ? { icon: [{ url: branding.favicon }] }
        : { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
    };
  } catch {
    return { ...baseMetadata, icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] } };
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-theme="light" style={{ colorScheme: 'light' }} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var saved=localStorage.getItem('anh-theme');var theme=saved==='dark'?'dark':'light';document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}catch(e){document.documentElement.dataset.theme='light';document.documentElement.style.colorScheme='light';}})();`,
          }}
        />
      </head>
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
