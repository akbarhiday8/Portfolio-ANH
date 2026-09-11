import Image from 'next/image';
import {
  ArrowRight, ArrowUpRight, BarChart3, BookOpen,
  BriefcaseBusiness, FileBadge2, Gamepad2, GraduationCap, Mail,
} from 'lucide-react';
import { CertificateGallery } from '@/components/certificate-gallery';
import { MotionController } from '@/components/motion-controller';
import { SiteNavigation } from '@/components/site-navigation';
import { SiteFooter } from '@/components/site-footer';
import { ThemeToggle } from '@/components/theme-toggle';
import { portfolioData } from '@/lib/portfolio-data';

const experienceImages = ['/work-building.jpg', '/work-code.jpg', '/work-laptop.jpg'];
const capabilityIcons = [GraduationCap, BriefcaseBusiness, BarChart3, BookOpen, FileBadge2, Gamepad2];

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

function SocialIcon({ label }: { label: string }) {
  if (label === 'LinkedIn') return <LinkedInLogo />;
  if (label === 'GitHub') return <GitHubLogo />;
  if (label === 'Instagram') return <InstagramLogo />;
  if (label === 'WhatsApp') return <WhatsAppLogo />;
  return <Mail size={19} />;
}

export default function Home() {
  const { profile, statistics, capabilities, education, experience, projects, certifications, socials } = portfolioData;

  return (
    <main>
      <MotionController />

      <header className="masthead-shell">
        <div className="masthead page-wrap">
          <a className="brand" href="#top" aria-label="ANH — kembali ke atas">
            <strong>ANH</strong><span>Portofolio Pribadi</span>
          </a>
          <SiteNavigation />
          <ThemeToggle />
        </div>
      </header>

      <section className="hero page-wrap" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Discipline turns plans<br />into progress</p>
          <h1 id="hero-title" aria-label="Akbar Nur Hidayanto">
            <span>Akbar</span>
            <LastWordAccent className="hero-name-accent">Nur</LastWordAccent>
            <span className="hero-surname">Hidayanto</span>
          </h1>
          <p className="hero-tagline"><LastWordAccent>A Journey of Work, Learning &amp; Creation.</LastWordAccent></p>
          <p className="hero-intro">{profile.introduction}</p>
          <a className="dark-button" href="#education">Lihat Pendidikan Saya <ArrowRight size={14} /></a>
          <dl className="stats" aria-label="Statistik karier">
            {statistics.map((stat) => <div key={stat.label}><dt>{stat.value}</dt><dd>{stat.label}</dd></div>)}
          </dl>
        </div>

        <div className="hero-art" aria-label="Ilustrasi potret Akbar Nur Hidayanto">
          <picture>
            <source media="(max-width: 420px)" srcSet="/profile-hero-480.webp" />
            <source media="(max-width: 650px)" srcSet="/profile-hero-640.webp" />
            <source media="(max-width: 850px)" srcSet="/profile-hero-768.webp" />
            <img className="hero-portrait" src="/profile-hero-941.webp" width={941} height={1671} loading="eager" decoding="async" fetchPriority="high" alt="Potret Akbar Nur Hidayanto bergaya tinta dengan kastel, bulan, buku, laptop, globe, dan kamera" />
          </picture>
          <p className="portrait-kanji" lang="ja" aria-label="Keberlanjutan adalah kekuatan">継続は力なり</p>
        </div>
      </section>

      <section className="about compact-section" id="about" aria-labelledby="about-heading">
        <div className="section-wrap about-grid">
          <SectionIndex title="Tentang Saya" caption="Manusia / Gagasan / Kemajuan" />
          <div className="about-copy" data-reveal>
            <h3 id="about-heading">Pikiran yang ingin tahu.<br /><LastWordAccent edge>Pencipta solusi nyata.</LastWordAccent></h3>
            <p>Saya adalah pemecah masalah yang senang mengubah gagasan kompleks menjadi solusi sederhana dan bermakna. Dengan latar belakang teknologi, desain, dan semangat belajar berkelanjutan, saya selalu antusias menghadapi tantangan baru dan menciptakan dampak positif.</p>
            <a className="about-link" href="#experience">Kenali Lebih Dekat <ArrowRight size={18} /></a>
          </div>
          <div className="capabilities" data-reveal>
            {capabilities.map((item, index) => {
              const Icon = capabilityIcons[index];
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
          <SectionIndex title="Pendidikan" caption="Fondasi / pembelajaran" />
          <div className="timeline education-timeline" data-reveal id="education-heading">
            {education.map((item) => <article key={item.period}><i /><b>{item.period}</b><h3>{item.title}</h3><p>{item.description}</p></article>)}
          </div>
          <div className="journey-next" data-reveal><ArrowRight size={20} /><p>Belajar<br />bertumbuh<br />berkarya</p></div>
        </div>
      </section>

      <div className="professional-story">
        <Image className="professional-ornament" src="/professional-work-ornament.webp" width={768} height={1152} sizes="(max-width: 650px) 78vw, 42vw" alt="" aria-hidden="true" />
      <section className="experience compact-section" id="experience" aria-label="Pengalaman">
        <div className="section-wrap indexed-grid">
          <SectionIndex title="Pengalaman" caption="Kerja nyata / dampak nyata" />
          <div className="experience-list" id="experience-heading">
            {experience.map((item, index) => <article className="experience-card" key={item.index} data-reveal>
              <div className="experience-media">
                <Image src={experienceImages[index]} fill sizes="(max-width: 520px) 100vw, (max-width: 850px) 180px, 220px" alt="" />
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
          <SectionIndex title="Portfolio Pilihan" caption="Gagasan / menjadi karya" />
          <div className="work-main">
            <div className="project-grid" id="work-heading">
              {projects.map((project, index) => <a className={`project${index === 0 ? ' project--featured' : ''}`} href={`/portfolio/${project.slug}`} key={project.index} data-reveal aria-label={`Lihat detail proyek ${project.title}`}>
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
              </a>)}
            </div>
          </div>
        </div>
      </section>
      </div>

      <section className="certificates compact-section" id="certificates" aria-label="Sertifikasi">
        <div className="section-wrap indexed-grid">
          <SectionIndex title="Sertifikasi" caption="Validasi / untuk kemajuan" />
          <CertificateGallery items={certifications} />
        </div>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-heading">
        <Image className="contact-art" src="/footer-castle-art.webp" fill sizes="100vw" alt="" />
        <div className="section-wrap contact-grid">
          <SectionIndex title="Mari Terhubung" caption="Ruang untuk dialog / dan kolaborasi" />
          <div className="contact-copy" data-reveal>
            <h3 id="contact-heading">Mari Ciptakan Sesuatu yang Bermakna.</h3>
            <p>Untuk diskusi proyek, pertukaran gagasan,<br />dan kolaborasi yang bermakna.</p>
            <span className="contact-availability">Tautan kontak sedang disiapkan</span>
            <div className="socials" aria-label="Media sosial">
              {socials.map((social) => social.href ? (
                <a href={social.href} aria-label={social.label} data-tooltip={social.label} key={social.label} target={social.href.startsWith('http') ? '_blank' : undefined} rel={social.href.startsWith('http') ? 'noreferrer' : undefined}>
                  <SocialIcon label={social.label} />
                </a>
              ) : (
                <span className="social-link is-disabled" aria-label={`${social.label} — tautan belum tersedia`} data-tooltip={`${social.label} segera tersedia`} key={social.label} role="img">
                  <SocialIcon label={social.label} />
                </span>
              ))}
            </div>
          </div>
          <p className="contact-note">Same<br />curiosity<br />a brighter<br />horizon</p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
