import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, ChevronDown,
  FileBadge2, Landmark, Tag,
} from 'lucide-react';
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

function displayDate(value: string) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
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
      card: 'summary_large_image', title: certification.name, description, images: [image],
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
  const status = meaningfulPublicText(extra.status);
  const credentialId = meaningfulPublicText(extra.credentialId);
  const issuedAt = displayDate(meaningfulPublicText(extra.issuedAt));
  const facts = [
    { label: 'Diterbitkan oleh', value: issuer, Icon: Landmark },
    { label: 'Tahun', value: year, Icon: CalendarDays },
    { label: 'Kategori', value: category, Icon: Tag },
    { label: 'Jenis sertifikat', value: meaningfulPublicText(extra.type), Icon: FileBadge2 },
  ].filter(({ value }) => Boolean(value));
  const topics = certification.topics.map(meaningfulPublicText).filter(Boolean);
  const visibleTopics = topics.slice(0, 6);
  const additionalTopics = topics.slice(6);
  const credentialUrl = publicLink(extra.credentialUrl);
  const related = certifications.filter((item) => item !== certification).slice(0, 3);

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
              {description ? <p>{description}</p> : null}
            </div>

            {certification.image ? <div className="certification-hero-media">
              <CertificateShowcase src={certification.image} alt={`Bukti ${certification.name}`} status={status} />
            </div> : null}

            <div className="certification-details">
              {facts.length ? <dl className="certification-facts">{facts.map(({ label, value, Icon }) => <div key={label}>
                <Icon size={20} aria-hidden="true" /><span><dt>{label}</dt><dd>{value}</dd></span>
              </div>)}</dl> : null}

              {topics.length ? <section className="certification-material" aria-labelledby="certificate-material-heading">
                <h2 id="certificate-material-heading">Materi yang Dipelajari / Diujikan</h2>
                <ol>{visibleTopics.map((topic, index) => <li key={`${topic}-${index}`}><span>{index + 1}</span><p>{topic}</p></li>)}</ol>
                {additionalTopics.length ? <details className="certification-material-more">
                  <summary>Lihat {additionalTopics.length} materi lainnya <ChevronDown size={16} /></summary>
                  <ol>{additionalTopics.map((topic, index) => <li key={`${topic}-${index + 6}`}><span>{index + 7}</span><p>{topic}</p></li>)}</ol>
                </details> : null}
              </section> : null}

              {credentialId || issuedAt || credentialUrl ? <section className="certification-credential" aria-labelledby="credential-heading">
                <h2 id="credential-heading">Informasi Kredensial</h2>
                {credentialId || issuedAt ? <dl>
                  {credentialId ? <div><dt>ID kredensial</dt><dd>{credentialId}</dd></div> : null}
                  {issuedAt ? <div><dt>Tanggal terbit</dt><dd>{issuedAt}</dd></div> : null}
                </dl> : null}
                {credentialUrl ? <a className="certification-verify-link" href={credentialUrl} target="_blank" rel="noopener noreferrer">Verifikasi kredensial<ArrowUpRight size={16} /></a> : null}
              </section> : null}
            </div>
          </div>
        </section>

        {related.length ? <section className="certificate-related section-wrap" aria-labelledby="certificate-related-heading">
          <header><h2 id="certificate-related-heading">Sertifikat Lainnya</h2><Link href="/#certificates">Lihat semua sertifikat<ArrowRight size={16} /></Link></header>
          <div>{related.map((item) => <Link href={`/sertifikasi/${certificationSlug(item.name)}`} key={item.name}>
            <span className="certificate-related-media">{item.image ? <Image src={item.image} fill sizes="160px" alt="" /> : <FileBadge2 size={28} />}</span>
            <span><small>{[item.category, item.year].filter(Boolean).join(' · ')}</small><strong>{item.name}</strong><p>{meaningfulPublicText(item.issuer)}</p></span>
            <ArrowRight size={17} />
          </Link>)}</div>
        </section> : null}

        <SiteFooter />
      </main>
    </>
  );
}
