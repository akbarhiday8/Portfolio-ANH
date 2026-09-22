import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
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
type ProcessStep = { title: string; description: string };

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

function publicMediaSource(value: unknown) {
  if (typeof value !== 'string') return '';
  const source = value.trim();
  return source.startsWith('/') ? source : publicLink(source);
}

function heroObjectPosition(value: unknown) {
  if (value === 'left') return 'left center';
  if (value === 'right') return 'right center';
  return 'center center';
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

function processSteps(value: unknown): ProcessStep[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const entry = item as Record<string, unknown>;
    const title = optionalText(entry.title);
    const description = optionalText(entry.description);
    return title && description ? [{ title, description }] : [];
  });
}

function evidenceLabel(artifactType: string) {
  const type = artifactType.toLowerCase();
  if (/website|aplikasi web|web app/.test(type)) return 'Lihat Website';
  if (/pdf|dokumen|laporan|presentasi|spreadsheet|excel|powerpoint/.test(type)) return 'Buka Dokumen';
  if (/dashboard|data/.test(type)) return 'Lihat Dashboard';
  return 'Lihat Bukti Proyek';
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { projects } = await getPortfolioContent();
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};

  const seo = project as typeof project & { seoTitle?: string; seoDescription?: string; seoImage?: string; heroImage?: string };
  const pageTitle = seo.seoTitle || `${project.title} — Portfolio Akbar Nur Hidayanto`;
  const pageDescription = seo.seoDescription || project.summary;
  const image = seo.seoImage || seo.heroImage || project.image;
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
    displayTitle?: unknown;
    technologies?: unknown;
    technology?: unknown;
    objective?: unknown;
    gallery?: unknown;
    heroImage?: unknown;
    heroPosition?: unknown;
  };
  const challenge = optionalText(project.challenge);
  const approach = optionalText(project.approach);
  const objective = optionalText(extra.objective);
  const technologies = Array.isArray(extra.technologies)
    ? extra.technologies.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).join(', ')
    : optionalText(extra.technologies || extra.technology);
  const evidenceUrl = publicLink(project.evidence?.href);
  const gallery = galleryItems(extra.gallery);
  const process = processSteps(project.process);
  const outcomes = optionalText(project.outcome).split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const isWebsite = /website|aplikasi web|web app/i.test(project.artifactType);
  const primaryActionLabel = evidenceLabel(project.artifactType);
  const displayTitle = optionalText(extra.displayTitle);
  const titleLines = (displayTitle || project.title).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const projectImage = publicMediaSource(project.image);
  const heroImage = publicMediaSource(extra.heroImage) || publicMediaSource(project.image);
  const showcaseBackdrop = heroImage && heroImage !== projectImage ? heroImage : '';
  const heroPosition = heroObjectPosition(extra.heroPosition);
  const previewAddress = isWebsite && evidenceUrl ? new URL(evidenceUrl).host.replace(/^www\./, '') : '';
  const previous = projects[(projectIndex - 1 + projects.length) % projects.length];
  const next = projects[(projectIndex + 1) % projects.length];
  const metadata = [
    { label: 'Peran', value: project.role },
    { label: 'Bidang', value: project.discipline },
    { label: 'Jenis hasil', value: project.artifactType },
    { label: 'Teknologi', value: technologies },
  ].filter(({ value }) => Boolean(value));

  return (
    <>
      <MotionController />
      <ReadingHeader activePage="work" profile={profile} siteContent={siteContent} />

      <main className="project-detail-page" id="top">
        <section className="case-hero">
          <div className="section-wrap case-hero-shell">
            <div className={`case-hero-grid${projectImage ? '' : ' without-media'}`}>
              <div className="case-intro">
                <p className="case-kicker">{[project.category, project.year].filter(Boolean).join(' · ')}</p>
                <h1>{titleLines.map((line, index) => <span className="case-title-line" key={`${line}-${index}`}>{line}</span>)}</h1>
                {project.summary ? <p className="case-summary">{project.summary}</p> : null}
                {evidenceUrl ? <div className="case-hero-actions">
                  <a className="detail-action detail-action-primary" href={evidenceUrl} target="_blank" rel="noopener noreferrer">{primaryActionLabel}<ArrowUpRight size={16} /></a>
                </div> : null}
              </div>
              {projectImage ? <div className="case-hero-media">
                <div className="case-showcase">
                  {showcaseBackdrop ? <div className="case-showcase-atmosphere" aria-hidden="true">
                    <Image src={showcaseBackdrop} alt="" fill quality={34} sizes="(max-width: 850px) 92vw, 54vw" style={{ objectPosition: heroPosition }} />
                  </div> : null}
                  <div className="case-showcase-card">
                    <EditorialMedia src={projectImage} priority expandable alt={`Dokumentasi visual proyek ${project.title}`} address={previewAddress} browserFrame={isWebsite} />
                    <div className="case-showcase-footer">
                      <span><strong>{project.title}</strong><small>{project.artifactType || 'Dokumentasi proyek'}</small></span>
                      <span>{previewAddress || 'Visual utama'}</span>
                    </div>
                  </div>
                </div>
              </div> : null}
            </div>
          </div>
        </section>

        {metadata.length ? <section className="case-facts section-wrap" aria-label="Informasi proyek">
          <dl>{metadata.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </section> : null}

        {challenge || objective || approach || project.scope?.length || outcomes.length ? <section className="case-content">
          <div className="section-wrap case-content-grid">
            {challenge || approach ? <article className="case-story-about"><h2>Tentang Proyek</h2>{challenge ? <p>{challenge}</p> : null}{approach ? <><h3>Pendekatan</h3><p>{approach}</p></> : null}</article> : null}
            {objective ? <article className="case-story-objective"><h2>Tujuan</h2><p>{objective}</p></article> : null}
            {project.scope?.length ? <article className="case-story-contribution"><h2>Kontribusi</h2><ul>{project.scope.map((item) => <li key={item}>{item}</li>)}</ul></article> : null}
            {outcomes.length ? <article className="case-story-outcome"><h2>Hasil</h2><ul className="case-result-list">{outcomes.map((item) => <li key={item}>{item}</li>)}</ul></article> : null}
          </div>
        </section> : null}

        {process.length ? <section className="case-process section-wrap" aria-labelledby="case-process-heading">
          <h2 id="case-process-heading">Proses Singkat</h2>
          <ol>{process.map((step, index) => <li key={`${step.title}-${index}`}>
            <span>{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.description}</p></div>
          </li>)}</ol>
        </section> : null}

        {gallery.length ? <section className="case-gallery section-wrap" aria-labelledby="case-gallery-heading">
          <h2 id="case-gallery-heading">Galeri Tampilan</h2>
          <div className={`case-gallery-grid count-${Math.min(gallery.length, 3)}`}>{gallery.map((item, index) => <figure key={`${item.src}-${index}`}>
            <EditorialMedia src={item.src} expandable alt={item.caption || `Dokumentasi ${project.title} ${index + 1}`} />
            {item.caption || item.description ? <figcaption><strong>{item.caption}</strong>{item.description ? <span>{item.description}</span> : null}</figcaption> : null}
          </figure>)}</div>
        </section> : null}

        {projects.length > 1 ? <nav className="section-wrap case-pagination" aria-label="Navigasi proyek">
          <Link href={`/portfolio/${previous.slug}`}><ArrowLeft size={17} /><span><small>Proyek sebelumnya</small><strong>{previous.title}</strong></span></Link>
          <Link href={`/portfolio/${next.slug}`}><span><small>Proyek berikutnya</small><strong>{next.title}</strong></span><ArrowRight size={17} /></Link>
        </nav> : null}

        <SiteFooter />
      </main>
    </>
  );
}
