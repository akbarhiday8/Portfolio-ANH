import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Code2, FolderKanban, Layers3, UserRound } from 'lucide-react';
import { notFound } from 'next/navigation';
import { EditorialMedia } from '@/components/editorial-media';
import { MotionController } from '@/components/motion-controller';
import { ReadingHeader } from '@/components/reading-header';
import { SiteFooter } from '@/components/site-footer';
import { getPortfolioContent } from '@/lib/cms-repository';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

type ProjectPageProps = { params: Promise<{ slug: string }> };
type GalleryItem = { src: string; caption: string; description: string };

function optionalText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
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

function galleryItems(value: unknown): GalleryItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const entry = item as Record<string, unknown>;
    const src = optionalText(entry.src || entry.image);
    if (!src || !(src.startsWith('/') || publicLink(src))) return [];
    return [{ src, caption: optionalText(entry.caption), description: optionalText(entry.description) }];
  });
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { projects } = await getPortfolioContent();
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};

  const seo = project as typeof project & { seoTitle?: string; seoDescription?: string; seoImage?: string };
  const pageTitle = seo.seoTitle || `${project.title} — Portfolio Akbar Nur Hidayanto`;
  const pageDescription = seo.seoDescription || project.summary;
  const image = seo.seoImage || project.image;
  const imageUrl = image ? new URL(image, SITE_URL).toString() : undefined;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: seo.seoTitle || project.title,
      description: pageDescription,
      type: 'article',
      images: imageUrl ? [{ url: imageUrl, alt: `Dokumentasi proyek ${project.title}` }] : undefined,
    },
    twitter: imageUrl ? {
      card: 'summary_large_image', title: seo.seoTitle || project.title, description: pageDescription, images: [imageUrl],
    } : undefined,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const { projects, profile, siteContent } = await getPortfolioContent();
  const projectIndex = projects.findIndex((item) => item.slug === slug);
  if (projectIndex < 0) notFound();

  const project = projects[projectIndex];
  const extra = project as typeof project & {
    technologies?: unknown;
    technology?: unknown;
    objective?: unknown;
    repositoryUrl?: unknown;
    gallery?: unknown;
  };
  const challenge = optionalText(project.challenge);
  const approach = optionalText(project.approach);
  const objective = optionalText(extra.objective);
  const technologies = Array.isArray(extra.technologies)
    ? extra.technologies.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).join(', ')
    : optionalText(extra.technologies || extra.technology);
  const evidenceUrl = publicLink(project.evidence?.href);
  const repositoryUrl = publicLink(extra.repositoryUrl);
  const gallery = galleryItems(extra.gallery);
  const isWebsite = /website|aplikasi web|web app/i.test(project.artifactType);
  const titleWords = project.title.trim().split(/\s+/);
  const titleHasLeadingAcronym = titleWords.length >= 3 && /^[A-Z0-9]{2,4}$/.test(titleWords[0]);
  const previewAddress = isWebsite && evidenceUrl ? new URL(evidenceUrl).host.replace(/^www\./, '') : '';
  const previous = projects[(projectIndex - 1 + projects.length) % projects.length];
  const next = projects[(projectIndex + 1) % projects.length];
  const metadata = [
    { label: 'Peran', value: project.role, Icon: UserRound },
    { label: 'Bidang', value: project.discipline, Icon: FolderKanban },
    { label: 'Jenis hasil', value: project.artifactType, Icon: Layers3 },
    { label: 'Teknologi', value: technologies, Icon: Code2 },
  ].filter(({ value }) => Boolean(value));

  return (
    <>
      <MotionController />
      <ReadingHeader activePage="work" profile={profile} siteContent={siteContent} />

      <main className="project-detail-page" id="top">
        <section className="case-hero">
          <div className={`section-wrap case-hero-grid${project.image ? '' : ' without-media'}`}>
            <div className="case-intro">
              <Link className="detail-return" href="/#work"><ArrowLeft size={16} />Kembali ke Portfolio</Link>
              <p className="case-kicker">{[project.category, project.year].filter(Boolean).join(' · ')}</p>
              <h1>{titleHasLeadingAcronym ? <><span className="case-title-line">{titleWords[0]}</span><span className="case-title-line">{titleWords.slice(1).join(' ')}</span></> : project.title}</h1>
              {project.summary ? <p className="case-summary">{project.summary}</p> : null}
              {evidenceUrl || repositoryUrl ? <div className="case-hero-actions">
                {evidenceUrl ? <a className="detail-action detail-action-primary" href={evidenceUrl} target="_blank" rel="noopener noreferrer">{isWebsite ? 'Lihat Website' : project.evidence?.label || 'Lihat Proyek'}<ArrowUpRight size={16} /></a> : null}
                {repositoryUrl ? <a className="detail-action detail-action-secondary" href={repositoryUrl} target="_blank" rel="noopener noreferrer">Lihat Kode<ArrowUpRight size={16} /></a> : null}
              </div> : null}
            </div>
            {project.image ? <div className="case-hero-media">
              <p className="case-media-label">{isWebsite ? 'Website preview' : 'Pratinjau proyek'}</p>
              <EditorialMedia src={project.image} priority expandable alt={`Dokumentasi visual proyek ${project.title}`} address={previewAddress} browserFrame={isWebsite} />
            </div> : null}
          </div>
        </section>

        {metadata.length ? <section className="case-facts section-wrap" aria-label="Informasi proyek">
          <dl>{metadata.map(({ label, value, Icon }) => <div key={label}><Icon size={19} aria-hidden="true" /><span><dt>{label}</dt><dd>{value}</dd></span></div>)}</dl>
        </section> : null}

        {challenge || objective || approach || project.scope?.length || project.outcome ? <section className="case-content">
          <div className="section-wrap case-content-grid">
            {challenge ? <article><h2>Tentang Proyek</h2><p>{challenge}</p></article> : null}
            {objective ? <article><h2>Tujuan</h2><p>{objective}</p></article> : null}
            {approach ? <article><h2>Pendekatan</h2><p>{approach}</p></article> : null}
            {project.scope?.length ? <article><h2>Kontribusi</h2><ul>{project.scope.map((item) => <li key={item}>{item}</li>)}</ul></article> : null}
            {project.outcome ? <article><h2>Hasil</h2><p>{project.outcome}</p></article> : null}
          </div>
        </section> : null}

        {gallery.length ? <section className="case-gallery section-wrap" aria-labelledby="case-gallery-heading">
          <h2 id="case-gallery-heading">Galeri Proyek</h2>
          <div className="case-gallery-grid">{gallery.map((item, index) => <figure key={`${item.src}-${index}`}>
            <EditorialMedia src={item.src} expandable alt={item.caption || `Dokumentasi ${project.title} ${index + 1}`} />
            {item.caption || item.description ? <figcaption><strong>{item.caption}</strong>{item.description ? <span>{item.description}</span> : null}</figcaption> : null}
          </figure>)}</div>
        </section> : null}

        {projects.length > 1 ? <nav className="section-wrap case-pagination" aria-label="Navigasi proyek">
          <Link href={`/portfolio/${previous.slug}`}><ArrowLeft size={17} /><span><small>Proyek sebelumnya</small>{previous.title}</span></Link>
          <Link href={`/portfolio/${next.slug}`}><span><small>Proyek berikutnya</small>{next.title}</span><ArrowRight size={17} /></Link>
        </nav> : null}

        <SiteFooter />
      </main>
    </>
  );
}
