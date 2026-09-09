import {
  ArrowRight, ArrowUp, ArrowUpRight, Award, BookOpen, BriefcaseBusiness,
  AtSign, Code2, Compass, FileBadge2, Grid2X2, Link2, PenLine,
} from 'lucide-react';
import { MotionController } from '@/components/motion-controller';
import { SiteNavigation } from '@/components/site-navigation';
import { portfolioData } from '@/lib/portfolio-data';

const capabilityIcons = {
  book: BookOpen,
  briefcase: BriefcaseBusiness,
  pencil: PenLine,
  grid: Grid2X2,
  award: Award,
  compass: Compass,
};

function SectionLead({ number, title, subtitle, headingId }: { number: string; title: string; subtitle: React.ReactNode; headingId: string }) {
  return (
    <header className="section-lead" data-reveal>
      <div><span className="section-number">{number}</span><p>{title}</p></div>
      <h2 id={headingId}>{subtitle}</h2>
    </header>
  );
}

export default function Home() {
  const { profile, statistics, capabilities, journey, experience, projects, certifications, socials } = portfolioData;

  return (
    <main id="top">
      <MotionController />
      <header className="masthead">
        <a className="brand" href="#top" aria-label="ANH — back to top">
          <strong>{profile.monogram}</strong>
          <span>Personal Portfolio</span>
        </a>
        <SiteNavigation />
        <a className="connect-link" href="#contact">Let&apos;s Connect <ArrowRight size={13} aria-hidden="true" /></a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Discipline turns plans<br />into progress</p>
          <h1 id="hero-title"><span>Akbar</span><span>Nur</span></h1>
          <p className="hero-tagline">A Journey of Work,<br />Learning &amp; Creation.</p>
          <p className="hero-intro">{profile.introduction}</p>
          <a className="primary-button" href="#journey">View My Journey <ArrowRight size={14} aria-hidden="true" /></a>
        </div>

        <div className="hero-art" aria-label="Profile artwork area">
          <div className="moon" aria-hidden="true" />
          <div className="art-placeholder" style={{ backgroundImage: `url(${profile.artwork})` }}>
            <div className="art-fallback">
              <span>ANH / Portrait</span>
              <small>Awaiting supplied profile artwork</small>
            </div>
          </div>
          <span className="ink-mark" aria-hidden="true" />
          <p className="edge-note">A brighter<br />more meaningful<br />tomorrow</p>
        </div>

        <dl className="stats" aria-label="Career statistics">
          {statistics.map((stat, index) => (
            <div key={stat.label} style={{ '--delay': `${1.05 + index * 0.08}s` } as React.CSSProperties}>
              <dt>{stat.value}</dt><dd>{stat.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="page-section about" id="about" aria-labelledby="about-title">
        <div className="about-index" data-reveal>
          <span className="section-number">01</span>
          <p>About Me</p>
        </div>
        <div className="about-copy" data-reveal>
          <p className="kicker">Identity / Practice</p>
          <h2 id="about-title">Curious mind.<br /><em>Practical creator.</em></h2>
          <p>{profile.about}</p>
          <p>Every chapter is approached with curiosity, discipline, and a commitment to learning what the work demands.</p>
        </div>
        <div className="capability-index" data-reveal>
          {capabilities.map((item) => {
            const Icon = capabilityIcons[item.icon];
            return (
              <div className="capability-row" key={item.title}>
                <Icon size={17} strokeWidth={1.25} aria-hidden="true" />
                <div><h3>{item.title}</h3><p>{item.description}</p></div>
                <ArrowUpRight size={14} strokeWidth={1.25} aria-hidden="true" />
              </div>
            );
          })}
        </div>
        <div className="contour-lines" aria-hidden="true"><i /><i /><i /></div>
      </section>

      <section className="page-section journey" id="journey" aria-labelledby="journey-title">
        <SectionLead number="02" title="Journey" headingId="journey-title" subtitle={<>A timeline<br />of growth</>} />
        <div className="timeline" data-reveal>
          {journey.map((item, index) => (
            <article key={item.period}>
              <span className="timeline-dot" aria-hidden="true" />
              <p className="period">{item.period}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="timeline-index">0{index + 1}</span>
            </article>
          ))}
        </div>
        <p className="journey-note" data-reveal>A better<br />version<br />ahead <ArrowRight size={18} aria-hidden="true" /></p>
      </section>

      <section className="page-section experience" id="experience" aria-labelledby="experience-title">
        <SectionLead number="03" title="Experience" headingId="experience-title" subtitle={<>Real work<br />real impact</>} />
        <div className="experience-grid">
          {experience.map((item) => (
            <article className="experience-item" key={item.index} data-reveal>
              <div className={`editorial-image tone-${item.tone}`} aria-hidden="true">
                <span>{item.index}</span><b>ANH</b><i />
              </div>
              <div className="experience-meta"><span>{item.organization}</span><span>{item.period}</span></div>
              <h3>{item.role}</h3>
              <p>{item.description}</p>
              <ArrowUpRight className="item-arrow" size={19} strokeWidth={1.25} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="page-section work" id="work" aria-labelledby="work-title">
        <div className="work-head">
          <SectionLead number="04" title="Selected Work" headingId="work-title" subtitle={<>Ideas<br />in action</>} />
          <a href="#work-archive">See All Projects <ArrowRight size={14} aria-hidden="true" /></a>
        </div>
        <div className="projects-grid" id="work-archive">
          {projects.map((project) => (
            <article className={`project project-${project.layout}`} key={project.index} data-reveal>
              <div className="project-image" aria-hidden="true">
                <span>{project.index}</span><b>{project.category.split(' · ')[0]}</b><i />
              </div>
              <div className="project-info">
                <div><h3>{project.title}</h3><p>{project.category} <span>/</span> {project.year}</p></div>
                <ArrowUpRight size={22} strokeWidth={1.2} aria-hidden="true" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section certificates" id="certificates" aria-labelledby="certificates-title">
        <SectionLead number="05" title="Certifications" headingId="certificates-title" subtitle={<>Validation<br />for progress</>} />
        <div className="certificate-grid">
          {certifications.map((certificate, index) => (
            <article key={certificate.name} data-reveal>
              <div className="certificate-top"><FileBadge2 size={24} strokeWidth={1.1} aria-hidden="true" /><span>0{index + 1}</span></div>
              <p className="certificate-category">{certificate.category}</p>
              <h3>{certificate.name}</h3>
              <div className="certificate-meta"><span>{certificate.issuer}</span><span>{certificate.year}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <div className="contact-atmosphere" aria-hidden="true"><span /><i /><b /></div>
        <div className="contact-index" data-reveal>
          <span className="section-number">06</span><p>Let&apos;s Connect</p>
          <small>Open to opportunities<br />and collaborations</small>
        </div>
        <div className="contact-copy" data-reveal>
          <p className="kicker">A new chapter / starts here</p>
          <h2 id="contact-title">Let&apos;s Build<br />Something <em>Meaningful.</em></h2>
          <p>I&apos;m always open to new opportunities, collaborations, and meaningful conversations.</p>
          <a className="light-button" href={socials[1].href}>Get In Touch <ArrowRight size={14} aria-hidden="true" /></a>
          <div className="socials">
            {socials.map((social, index) => {
              const Icon = [Link2, AtSign, Code2][index];
              return <a href={social.href} key={social.label}><Icon size={16} strokeWidth={1.3} aria-hidden="true" />{social.label}</a>;
            })}
          </div>
        </div>
        <p className="contact-note">Same curiosity<br />a brighter horizon</p>
      </section>

      <footer>
        <a className="footer-brand" href="#top">ANH</a>
        <p>© {new Date().getFullYear()} Akbar Nur.<br />All rights reserved.</p>
        <p>Built with purpose.</p>
        <a className="back-top" href="#top" aria-label="Back to top"><ArrowUp size={17} /></a>
      </footer>
    </main>
  );
}
