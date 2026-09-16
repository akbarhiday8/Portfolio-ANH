import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileBadge2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { CertificateViewer } from '@/components/certificate-viewer';
import { MotionController } from '@/components/motion-controller';
import { ReadingHeader } from '@/components/reading-header';
import { SiteFooter } from '@/components/site-footer';
import { certificationSlug } from '@/lib/certification-routes';
import { getPortfolioContent } from '@/lib/cms-repository';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

type CertificationPageProps = { params: Promise<{ slug: string }> };

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

  return (
    <>
      <MotionController />
      <ReadingHeader activePage="certificates" profile={profile} siteContent={siteContent} />
      <main className="certification-detail-page" id="top">
        <section className="certification-hero">
          <div className="section-wrap certification-hero-grid">
            <div className="certification-intro">
              <Link className="certification-back" href="/#certificates"><ArrowLeft size={16} />Kembali ke Sertifikasi</Link>
              <p className="certification-kicker">{certification.category} · {certification.year}</p>
              <h1>{certification.name}</h1>
              <p>{certification.description}</p>
              <dl>
                <div><dt>Diterbitkan oleh</dt><dd>{certification.issuer}</dd></div>
                <div><dt>Tahun</dt><dd>{certification.year}</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <section className="certification-document" aria-labelledby="certificate-document-heading">
          <div className="section-wrap">
            <header className="certification-section-heading"><span>Bukti sertifikasi</span><h2 id="certificate-document-heading">Dokumen sertifikat</h2></header>
            {certification.image ? <CertificateViewer src={certification.image} alt={`Bukti ${certification.name}`} /> : (
              <div className="certification-document-empty"><FileBadge2 size={54} strokeWidth={1.1} /><strong>Bukti sertifikat belum ditambahkan</strong><p>Dokumen akan tampil di area ini setelah tersedia di CMS.</p></div>
            )}
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
