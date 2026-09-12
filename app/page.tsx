import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, BarChart3, BookOpen,
  BriefcaseBusiness, FileBadge2, Gamepad2, GraduationCap, Mail,
} from 'lucide-react';
import { CertificateGallery } from '@/components/certificate-gallery';
import { MotionController } from '@/components/motion-controller';
import { SiteNavigation } from '@/components/site-navigation';
import { SiteFooter } from '@/components/site-footer';
import { ThemeToggle } from '@/components/theme-toggle';
import { getPortfolioContent } from '@/lib/cms-server';

export const dynamic = 'force-dynamic';

const capabilityIcons = {
  book: GraduationCap,
  briefcase: BriefcaseBusiness,
  pencil: BarChart3,
  chart: BarChart3,
  grid: BookOpen,
  award: FileBadge2,
  compass: Gamepad2,
  game: Gamepad2,
} as const;

function SectionIndex({ title, caption }: { title: string; caption: string }) {
  return (
    <header className="section-index" data-reveal>
      <i aria-hidden="true" />
      <h2>{title}</h2>
      <p>{caption}</p>
    </header>
  );
}

function LastWordAccent({ children, edge = false, className = '' }: { children: string; edge?: boolean; className?: string }) {
  const words = children.trim().split(/\s+/);
  const lastWord = words.pop();
  const accentClassName = ['brush-accent-word', edge ? 'brush-accent-word--edge' : '', className].filter(Boolean).join(' ');

  return (
    <>
      {words.length > 0 ? `${words.join(' ')} ` : ''}
      <span className={accentClassName}>{lastWord}</span>
    </>
  );
}

function MultilineAccent({ children }: { children: string }) {
  const lines = children.split('\n').filter(Boolean);
  return <>{lines.map((line, index) => <span key={`${line}-${index}`}>{index === lines.length - 1 ? <LastWordAccent edge>{line}</LastWordAccent> : line}{index < lines.length - 1 ? <br /> : null}</span>)}</>;
}

function LinkedInLogo() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" /></svg>;
}

function GitHubLogo() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .7C5.73.7.65 5.78.65 12.05c0 5.02 3.25 9.28 7.76 10.78.57.1.78-.25.78-.55v-2.17c-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.71.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.95.1-.73.4-1.24.72-1.52-2.52-.29-5.17-1.26-5.17-5.61 0-1.24.44-2.25 1.17-3.05-.12-.29-.51-1.44.11-3 0 0 .95-.3 3.12 1.16a10.8 10.8 0 0 1 5.68 0c2.17-1.47 3.12-1.16 3.12-1.16.62 1.56.23 2.71.11 3 .73.8 1.17 1.81 1.17 3.05 0 4.36-2.66 5.32-5.19 5.6.41.36.77 1.06.77 2.13v3.16c0 .31.2.66.78.55A11.36 11.36 0 0 0 23.35 12.05C23.35 5.78 18.27.7 12 .7z" /></svg>;
}

function InstagramLogo() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.02 4.85.07 1.37.06 2.63.35 3.61 1.33.97.97 1.26 2.24 1.32 3.6.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.37-.35 2.63-1.32 3.61-.98.97-2.24 1.26-3.61 1.32-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.37-.06-2.63-.35-3.61-1.32-.97-.98-1.26-2.24-1.32-3.61-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.06-1.36.35-2.63 1.32-3.6.98-.98 2.24-1.27 3.61-1.33C8.42 2.18 8.8 2.16 12 2.16zm0 1.95c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.18.4-.55.22-.94.47-1.35.88-.41.42-.67.81-.88 1.36-.16.41-.35 1.03-.4 2.18-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.4 2.18.21.55.47.94.88 1.35.41.42.8.67 1.35.89.41.16 1.03.35 2.18.4 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.18-.4.55-.22.94-.47 1.35-.89.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.18.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.4-2.18-.21-.55-.47-.94-.88-1.36-.41-.41-.8-.66-1.35-.88-.41-.16-1.03-.35-2.18-.4-1.24-.06-1.61-.07-4.76-.07zm0 3.73a4.16 4.16 0 1 1 0 8.32 4.16 4.16 0 0 1 0-8.32zm0 6.86a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4zm5.37-7.88a.97.97 0 1 1-1.94 0 .97.97 0 0 1 1.94 0z" /></svg>;
}

function WhatsAppLogo() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47a8.88 8.88 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12.04 2a9.84 9.84 0 0 0-8.4 14.96L2.05 22l5.18-1.55A9.95 9.95 0 0 0 12.04 21 9.86 9.86 0 0 0 22 11.15 9.86 9.86 0 0 0 12.04 2zm0 17.34a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.07.92.92-2.99-.2-.31a8.18 8.18 0 1 1 6.83 3.7z" /></svg>;
}

function XLogo() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 10.62 21.17 2h-1.77l-6.49 7.49L7.73 2H1.75l7.83 11.33L1.75 22h1.77l6.85-7.56L15.84 22h5.98l-8.12-11.38Zm-2.43 2.68-.79-1.13L4.16 3.32h2.72l5.1 7.14.79 1.12 6.63 9.29h-2.72l-5.41-7.57Z" /></svg>; }
function YouTubeLogo() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.56 12 3.56 12 3.56s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.2 31.38 31.38 0 0 0 0 12a31.38 31.38 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14A31.38 31.38 0 0 0 24 12a31.38 31.38 0 0 0-.5-5.8ZM9.6 15.57V8.43L15.82 12 9.6 15.57Z" /></svg>; }
function FacebookLogo() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.4c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.88v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" /></svg>; }
function TelegramLogo() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.93 4.23 18.6 19.91c-.25 1.1-.9 1.37-1.83.85l-5.08-3.74-2.45 2.36c-.27.27-.5.5-1.02.5l.36-5.18 9.43-8.52c.41-.36-.09-.57-.64-.2L5.72 13.32.7 11.75c-1.09-.34-1.11-1.09.23-1.61L20.57 2.57c.91-.34 1.7.2 1.36 1.66Z" /></svg>; }
function DiscordLogo() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.32 4.37A19.79 19.79 0 0 0 15.36 2c-.21.38-.46.9-.63 1.3a18.36 18.36 0 0 0-5.48 0c-.17-.4-.43-.92-.64-1.3a19.73 19.73 0 0 0-4.96 2.38C.5 9.09-.35 13.67.08 18.18A19.9 19.9 0 0 0 6.16 21.2c.49-.66.93-1.36 1.3-2.1-.71-.27-1.39-.6-2.03-.97.17-.13.34-.26.5-.4a14.18 14.18 0 0 0 12.14 0l.5.4c-.64.38-1.32.7-2.03.97.38.74.82 1.44 1.3 2.1a19.86 19.86 0 0 0 6.08-3.02c.5-5.23-.84-9.77-3.6-13.8ZM8.02 15.42c-1.18 0-2.15-1.08-2.15-2.4 0-1.33.95-2.41 2.15-2.41 1.2 0 2.17 1.09 2.15 2.4 0 1.33-.95 2.41-2.15 2.41Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.4 0-1.33.95-2.41 2.15-2.41 1.2 0 2.17 1.09 2.15 2.4 0 1.33-.95 2.41-2.15 2.41Z" /></svg>; }
function DribbbleLogo() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm7.93 5.53a9.73 9.73 0 0 1 2.21 6.08c-.32-.07-3.52-.72-6.74-.31-.07-.17-.14-.35-.22-.52-.22-.52-.47-1.04-.73-1.55 3.56-1.45 5.17-3.54 5.48-3.7ZM12 1.86a10.1 10.1 0 0 1 6.73 2.56c-.26.37-1.7 2.29-5.11 3.57a54.72 54.72 0 0 0-3.61-5.65c.64-.31 1.31-.48 1.99-.48ZM7.96 3.08a65.4 65.4 0 0 1 3.59 5.58c-4.48 1.19-8.43 1.17-8.85 1.16a10.16 10.16 0 0 1 5.26-6.74ZM1.85 12v-.32c.41.01 5.05.08 10.57-1.57.31.6.6 1.22.87 1.84l-.42.13C7.17 13.93 4.13 18.94 3.88 19.36A10.1 10.1 0 0 1 1.85 12Zm10.15 10.15a10.08 10.08 0 0 1-6.72-2.55c.19-.38 2.44-4.73 8.7-6.91h.03a42.1 42.1 0 0 1 1.79 8.76c-1.17.45-2.45.7-3.8.7Zm5.6-1.7a44.15 44.15 0 0 0-1.64-8.22c3.03-.48 5.68.31 6.01.42a10.14 10.14 0 0 1-4.37 7.8Z" /></svg>; }
function TextBrand({ children }: { children: string }) { return <svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="15.8" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="currentColor">{children}</text></svg>; }
function WebsiteLogo() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.8" d="M3.4 12h17.2M12 3.3c2.5 2.45 3.8 5.35 3.8 8.7s-1.3 6.25-3.8 8.7M12 3.3C9.5 5.75 8.2 8.65 8.2 12s1.3 6.25 3.8 8.7" /><circle cx="12" cy="12" r="8.7" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>; }

type SocialLinkData = { label: string; href: string | null; icon?: string; customIcon?: string };

function SocialIcon({ social }: { social: SocialLinkData }) {
  if (social.customIcon) return <Image src={social.customIcon} width={24} height={24} unoptimized alt="" />;
  const key = (social.icon || social.label).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key.includes('linkedin')) return <LinkedInLogo />;
  if (key.includes('github')) return <GitHubLogo />;
  if (key.includes('instagram')) return <InstagramLogo />;
  if (key.includes('whatsapp')) return <WhatsAppLogo />;
  if (key === 'x' || key.includes('twitter')) return <XLogo />;
  if (key.includes('youtube')) return <YouTubeLogo />;
  if (key.includes('facebook')) return <FacebookLogo />;
  if (key.includes('telegram')) return <TelegramLogo />;
  if (key.includes('discord')) return <DiscordLogo />;
  if (key.includes('dribbble')) return <DribbbleLogo />;
  if (key.includes('tiktok')) return <TextBrand>Tk</TextBrand>;
  if (key.includes('behance')) return <TextBrand>Be</TextBrand>;
  if (key.includes('medium')) return <TextBrand>M</TextBrand>;
  if (key.includes('threads')) return <TextBrand>@</TextBrand>;
  if (key.includes('figma')) return <TextBrand>Fg</TextBrand>;
  if (key.includes('website') || key.includes('web')) return <WebsiteLogo />;
  return <Mail size={19} />;
}

export default async function Home() {
  const { siteContent, profile, statistics, capabilities, education, experience, projects, certifications, socials } = await getPortfolioContent();

  return (
    <main>
      <MotionController />

      <header className="masthead-shell">
        <div className="masthead page-wrap">
          <a className="brand" href="#top" aria-label="ANH — kembali ke atas">
            <strong>{profile.monogram}</strong><span>{siteContent.brandSubtitle}</span>
          </a>
          <SiteNavigation />
          <ThemeToggle />
        </div>
      </header>

      <section className="hero page-wrap" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">{profile.eyebrow}</p>
          <h1 id="hero-title" aria-label="Akbar Nur Hidayanto">
            <span>Akbar</span>
            <LastWordAccent className="hero-name-accent">Nur</LastWordAccent>
            <span className="hero-surname">Hidayanto</span>
          </h1>
          <p className="hero-tagline"><LastWordAccent>{profile.tagline}</LastWordAccent></p>
          <p className="hero-intro">{profile.introduction}</p>
          <a className="dark-button" href="#education">Lihat Pendidikan Saya <ArrowRight size={14} /></a>
          <dl className="stats" aria-label="Statistik karier">
            {statistics.map((stat) => <div key={stat.label}><dt>{stat.value}</dt><dd>{stat.label}</dd></div>)}
          </dl>
        </div>

        <div className="hero-art" aria-label="Ilustrasi potret Akbar Nur Hidayanto">
          <Image className="hero-portrait" src={profile.artwork} width={941} height={1671} priority sizes="(max-width: 650px) 94vw, (max-width: 1100px) 58vw, 49vw" alt={`Potret ${profile.name} bergaya tinta`} />
          <p className="portrait-kanji" lang="ja" aria-label="Keberlanjutan adalah kekuatan">継続は力なり</p>
        </div>
      </section>

      <section className="about compact-section" id="about" aria-labelledby="about-heading">
        <div className="section-wrap about-grid">
          <SectionIndex title={siteContent.aboutTitle} caption={siteContent.aboutCaption} />
          <div className="about-copy" data-reveal>
            <h3 id="about-heading"><MultilineAccent>{siteContent.aboutHeading}</MultilineAccent></h3>
            <p>{siteContent.aboutBody}</p>
            <a className="about-link" href="#experience">{siteContent.aboutCta} <ArrowRight size={18} /></a>
          </div>
          <div className="capabilities" data-reveal>
            {capabilities.map((item) => {
              const Icon = capabilityIcons[item.icon as keyof typeof capabilityIcons] ?? capabilityIcons.grid;
              return <article key={item.title}><Icon size={25} strokeWidth={1.6} /><div><h4>{item.title}</h4><p>{item.description}</p></div></article>;
            })}
          </div>
        </div>
      </section>

      <div className="architecture-seam" aria-hidden="true">
        <Image
          className="story-architecture"
          src="/about-architecture-sketch.webp"
          width={1100}
          height={733}
          sizes="(max-width: 520px) 112vw, (max-width: 850px) 88vw, 46vw"
          alt=""
        />
      </div>

      <section className="journey compact-section" id="education" aria-label="Pendidikan">
        <div className="section-wrap journey-grid">
          <SectionIndex title={siteContent.educationTitle} caption={siteContent.educationCaption} />
          <div className="timeline education-timeline" data-reveal id="education-heading">
            {education.map((item) => <article key={item.period}><i /><b>{item.period}</b><h3>{item.title}</h3><p>{item.description}</p></article>)}
          </div>
          <div className="journey-next" data-reveal><ArrowRight size={20} /><p>{siteContent.educationNote}</p></div>
        </div>
      </section>

      <div className="professional-story">
        <Image className="professional-ornament" src="/professional-work-ornament.webp" width={768} height={1152} sizes="(max-width: 650px) 78vw, 42vw" alt="" aria-hidden="true" />
      <section className="experience compact-section" id="experience" aria-label="Pengalaman">
        <div className="section-wrap indexed-grid">
          <SectionIndex title={siteContent.experienceTitle} caption={siteContent.experienceCaption} />
          <div className="experience-list" id="experience-heading">
            {experience.map((item) => <article className="experience-card" key={`${item.role}-${item.period}`} data-reveal>
              <div className="experience-media">
                <Image src={item.image} fill sizes="(max-width: 520px) 100vw, (max-width: 850px) 180px, 220px" alt="" />
              </div>
              <div className="experience-role">
                <b>{item.period}</b>
                <h3>{item.role}</h3>
                <span>{item.organization}</span>
              </div>
              <div className="experience-content">
                <p className="experience-summary">{item.description}</p>
                <details className="experience-details">
                  <summary>Lihat tugas dan tanggung jawab</summary>
                  <ul>{item.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}</ul>
                </details>
              </div>
              <i className="experience-marker" aria-hidden="true" />
            </article>)}
          </div>
        </div>
      </section>

      <section className="work compact-section" id="work" aria-label="Portfolio pilihan">
        <div className="section-wrap indexed-grid">
          <SectionIndex title={siteContent.portfolioTitle} caption={siteContent.portfolioCaption} />
          <div className="work-main">
            <div className="project-grid" id="work-heading">
              {projects.map((project, index) => <Link className={`project${index === 0 ? ' project--featured' : ''}`} href={`/portfolio/${project.slug}`} key={project.slug} data-reveal aria-label={`Lihat detail proyek ${project.title}`}>
                <div className="project-image">
                  <Image
                    src={project.image}
                    fill
                    sizes={index === 0 ? '(max-width: 650px) 100vw, (max-width: 850px) 62vw, 48vw' : '(max-width: 650px) 100vw, (max-width: 850px) 32vw, 18vw'}
                    alt=""
                  />
                </div>
                <div className="project-copy">
                  <p className="project-label">{index === 0 ? 'Karya unggulan' : 'Proyek pilihan'}</p>
                  <div className="project-heading">
                    <h3>{project.title}</h3>
                    <span className="project-arrow" aria-hidden="true"><ArrowUpRight size={17} /></span>
                  </div>
                  <p className="project-meta"><span>{project.category}</span><span>{project.year}</span></p>
                  <p className="project-open">Buka studi kasus <ArrowRight size={14} /></p>
                </div>
              </Link>)}
            </div>
          </div>
        </div>
      </section>
      </div>

      <section className="certificates compact-section" id="certificates" aria-label="Sertifikasi">
        <div className="section-wrap indexed-grid">
          <SectionIndex title={siteContent.certificatesTitle} caption={siteContent.certificatesCaption} />
          <CertificateGallery items={certifications} />
        </div>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-heading">
        <Image className="contact-art" src="/footer-castle-art.webp" fill sizes="100vw" alt="" />
        <div className="section-wrap contact-grid">
          <SectionIndex title={siteContent.contactTitle} caption={siteContent.contactCaption} />
          <div className="contact-copy" data-reveal>
            <h3 id="contact-heading">{siteContent.contactHeading}</h3>
            <p>{siteContent.contactDescription}</p>
            <span className="contact-availability">{siteContent.contactAvailability}</span>
            <div className="socials" aria-label="Media sosial">
              {socials.map((social) => social.href ? (
                <a href={social.href} aria-label={social.label} data-tooltip={social.label} key={social.label} target={social.href.startsWith('http') ? '_blank' : undefined} rel={social.href.startsWith('http') ? 'noreferrer' : undefined}>
                  <SocialIcon social={social} />
                </a>
              ) : (
                <span className="social-link is-disabled" aria-label={`${social.label} — tautan belum tersedia`} data-tooltip={`${social.label} segera tersedia`} key={social.label}>
                  <SocialIcon social={social} />
                </span>
              ))}
            </div>
          </div>
          <p className="contact-note">{siteContent.contactNote}</p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
