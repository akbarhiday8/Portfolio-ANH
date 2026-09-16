import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { CertificateShowcase } from '@/components/certificate-showcase';
import { MotionController } from '@/components/motion-controller';
import { ReadingHeader } from '@/components/reading-header';
import { SiteFooter } from '@/components/site-footer';
import { certificationSlug } from '@/lib/certification-routes';
import { getPortfolioContent } from '@/lib/cms-repository';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

type CertificationPageProps = { params: Promise<{ slug: string }> };

const publicPlaceholderPattern = /akan ditambahkan|belum ditambahkan|belum tersedia|segera tersedia|to be added|coming soon/i;

function meaningfulPublicText(value: string | null | undefined) {
  const text = (value ?? '').trim();
  return text && !publicPlaceholderPattern.test(text) ? text : '';
}

export async function generateMetadata({ params }: CertificationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { certifications } = await getPortfolioContent();
  const certification = certifications.find((item) => certificationSlug(item.name) === slug);
  if (!certification) return {};
  const image = certification.image ? new URL(certification.image, SITE_URL).toString() : undefined;
  return {
    title: `${certification.name} — Sertifikasi Akbar Nur Hidayanto`,
    description: certification.description,
    alternates: { canonical: `/sertifikasi/${slug}` },
    openGraph: {
      title: certification.name,
      description: certification.description,
      type: 'article',
      images: image ? [{ url: image, alt: `Bukti ${certification.name}` }] : undefined,
    },
    twitter: image ? {
      card: 'summary_large_image',
      title: certification.name,
      description: certification.description,
      images: [image],
    } : undefined,
  };
}

export default async function CertificationDetailPage({ params }: CertificationPageProps) {
  const { slug } = await params;
  const { certifications, profile, siteContent } = await getPortfolioContent();
  const certification = certifications.find((item) => certificationSlug(item.name) === slug);
  if (!certification) notFound();
  const issuer = meaningfulPublicText(certification.issuer);
  const description = meaningfulPublicText(certification.description);
  const year = meaningfulPublicText(certification.year);
  const category = meaningfulPublicText(certification.category);
  const kicker = [category, year].filter(Boolean).join(' · ');
  const hasMetadata = Boolean(issuer || year);

  return (
    <>
      <MotionController />
      <ReadingHeader activePage="certificates" profile={profile} siteContent={siteContent} />
      <main className="certification-detail-page" id="top">
        <section className="certification-hero">
          <div className={`section-wrap certification-hero-grid${certification.image ? '' : ' without-media'}`}>
            <div className="certification-intro">
              <Link className="certification-back" href="/#certificates"><ArrowLeft size={16} />Kembali ke Sertifikasi</Link>
              {kicker ? <p className="certification-kicker">{kicker}</p> : null}
              <h1>{certification.name}</h1>
              {description ? <p>{description}</p> : null}
              {hasMetadata ? <dl>
                {issuer ? <div><dt>Diterbitkan oleh</dt><dd>{issuer}</dd></div> : null}
                {year ? <div><dt>Tahun</dt><dd>{year}</dd></div> : null}
              </dl> : null}
            </div>
            {certification.image ? <div className="certification-hero-media"><CertificateShowcase src={certification.image} alt={`Bukti ${certification.name}`} /></div> : null}
          </div>
        </section>

        {certification.topics.length ? <section className="certification-material" aria-labelledby="certificate-material-heading">
          <div className="section-wrap certification-material-grid">
            <header className="certification-section-heading"><span>Ruang lingkup</span><h2 id="certificate-material-heading">Materi yang dipelajari / diujikan</h2></header>
            <ul>{certification.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
          </div>
        </section> : null}

        <SiteFooter />
      </main>
    </>
  );
}
