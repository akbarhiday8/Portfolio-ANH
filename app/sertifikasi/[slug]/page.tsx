import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
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

function meaningfulPublicText(value: unknown) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text && !publicPlaceholderPattern.test(text) ? text : '';
}

function publicLink(value: unknown) {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch {
    return '';
  }
}

export async function generateMetadata({ params }: CertificationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { certifications } = await getPortfolioContent();
  const certification = certifications.find((item) => certificationSlug(item.name) === slug);
  if (!certification) return {};
  const image = certification.image ? new URL(certification.image, SITE_URL).toString() : undefined;
  const description = meaningfulPublicText(certification.description);
  return {
    title: `${certification.name} — Sertifikasi Akbar Nur Hidayanto`,
    description,
    alternates: { canonical: `/sertifikasi/${slug}` },
    openGraph: {
      title: certification.name,
      description,
      type: 'article',
      images: image ? [{ url: image, alt: `Bukti ${certification.name}` }] : undefined,
    },
    twitter: image ? {
      card: 'summary_large_image',
      title: certification.name,
      description,
      images: [image],
    } : undefined,
  };
}

export default async function CertificationDetailPage({ params }: CertificationPageProps) {
  const { slug } = await params;
  const { certifications, profile, siteContent } = await getPortfolioContent();
  const certification = certifications.find((item) => certificationSlug(item.name) === slug);
  if (!certification) notFound();
  const extra = certification as typeof certification & {
    type?: unknown;
    status?: unknown;
    credentialId?: unknown;
    issuedAt?: unknown;
    credentialUrl?: unknown;
  };
  const issuer = meaningfulPublicText(certification.issuer);
  const description = meaningfulPublicText(certification.description);
  const year = meaningfulPublicText(certification.year);
  const category = meaningfulPublicText(certification.category);
  const facts = [
    { label: 'Diterbitkan oleh', value: issuer },
    { label: 'Tahun', value: year },
    { label: 'Jenis', value: meaningfulPublicText(extra.type) },
    { label: 'Status', value: meaningfulPublicText(extra.status) },
    { label: 'ID kredensial', value: meaningfulPublicText(extra.credentialId) },
    { label: 'Tanggal terbit', value: meaningfulPublicText(extra.issuedAt) },
  ].filter(({ value }) => Boolean(value));
  const topics = certification.topics.map(meaningfulPublicText).filter(Boolean);
  const credentialUrl = publicLink(extra.credentialUrl);

  return (
    <>
      <MotionController />
      <ReadingHeader activePage="certificates" profile={profile} siteContent={siteContent} />
      <main className="certification-detail-page" id="top">
        <section className="certification-hero">
          <div className={`section-wrap certification-hero-grid${certification.image ? '' : ' without-media'}`}>
            <div className="certification-intro">
              <Link className="detail-return" href="/#certificates"><ArrowLeft size={16} />Kembali ke Sertifikasi</Link>
              {category || year ? <p className="certification-kicker">{[category, year].filter(Boolean).join(' · ')}</p> : null}
              <h1>{certification.name}</h1>
              {issuer ? <p className="certification-issuer">{issuer}</p> : null}
              {description ? <p>{description}</p> : null}
            </div>
            {certification.image ? <div className="certification-hero-media"><CertificateShowcase src={certification.image} alt={`Bukti ${certification.name}`} /></div> : null}
            {facts.length ? <dl className="certification-facts">{facts.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : null}
          </div>
        </section>

        {topics.length ? <section className="certification-material" aria-labelledby="certificate-material-heading">
          <div className="section-wrap">
            <h2 id="certificate-material-heading">Materi yang Dipelajari / Diujikan</h2>
            <ul>{topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
          </div>
        </section> : null}

        {credentialUrl ? <section className="certification-credential section-wrap">
          <h2>Informasi kredensial</h2>
          <a href={credentialUrl} target="_blank" rel="noopener noreferrer">Verifikasi kredensial<ArrowUpRight size={16} /></a>
        </section> : null}

        <SiteFooter />
      </main>
    </>
  );
}
