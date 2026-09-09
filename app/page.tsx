import Image from 'next/image';
import {
  ArrowRight, ArrowUp, ArrowUpRight, BarChart3, BookOpen,
  BriefcaseBusiness, Code2, FileBadge2, Gamepad2, GraduationCap,
  Link2, Mail, Monitor, ShieldCheck,
} from 'lucide-react';
import { MotionController } from '@/components/motion-controller';
import { SiteNavigation } from '@/components/site-navigation';
import { portfolioData } from '@/lib/portfolio-data';

const experienceImages = ['/work-building.jpg', '/work-code.jpg', '/work-laptop.jpg'];
const projectImages = ['/work-dashboard.jpg', '/work-mobile.jpg', '/work-branding.jpg', '/og.png'];
const capabilityIcons = [GraduationCap, BriefcaseBusiness, BarChart3, BookOpen, FileBadge2, Gamepad2];
const certificateIcons = [Monitor, ShieldCheck, BarChart3, FileBadge2];

function SectionIndex({ number, title, caption }: { number: string; title: string; caption: string }) {
  return (
    <header className="section-index" data-reveal>
      <span>{number}</span>
      <h2>{title}</h2>
      <p>{caption}</p>
    </header>
  );
}

export default function Home() {
  const { profile, statistics, capabilities, journey, experience, projects, certifications, socials } = portfolioData;

  return (
    <main id="top">
      <MotionController />

      <header className="masthead page-wrap">
        <a className="brand" href="#top" aria-label="ANH — back to top">
          <strong>ANH</strong><span>Personal Portfolio</span>
        </a>
        <SiteNavigation />
        <a className="header-cta" href="#contact">Let&apos;s Connect <ArrowRight size={14} /></a>
      </header>

      <section className="hero page-wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Discipline turns plans<br />into progress</p>
          <h1 id="hero-title"><span>Akbar</span><span>Nur</span></h1>
          <p className="hero-tagline">A Journey of Work,<br />Learning &amp; Creation.</p>
          <p className="hero-intro">{profile.introduction}</p>
          <a className="dark-button" href="#journey">View My Journey <ArrowRight size={14} /></a>
          <dl className="stats" aria-label="Career statistics">
            {statistics.map((stat) => <div key={stat.label}><dt>{stat.value}</dt><dd>{stat.label}</dd></div>)}
          </dl>
        </div>

        <div className="hero-art" aria-label="Portrait artwork of Akbar Nur">
          <div className="hero-moon" aria-hidden="true" />
          <Image className="hero-portrait" src="/profile-artwork.webp" width={941} height={1671} priority sizes="(max-width: 820px) 100vw, 60vw" alt="Ink-style portrait of Akbar Nur with castle, moon, books, laptop, globe, and camera" />
          <i className="red-stroke red-stroke-one" aria-hidden="true" />
          <i className="red-stroke red-stroke-two" aria-hidden="true" />
          <p className="edge-copy">A<br />brighter<br />more<br />meaningful<br />tomorrow</p>
        </div>
      </section>

      <section className="about compact-section" id="about" aria-labelledby="about-heading">
        <div className="section-wrap about-grid">
          <SectionIndex number="01" title="About Me" caption="People / Ideas / Progress" />
          <div className="about-copy" data-reveal>
            <h3 id="about-heading">Curious mind.<br />Practical creator.</h3>
            <p>I&apos;m a problem solver who enjoys turning complex ideas into simple, meaningful solutions. With a background in technology, design, and continuous learning, I&apos;m always excited to take on new challenges and create positive impact.</p>
          </div>
          <div className="capabilities" data-reveal>
            {capabilities.map((item, index) => {
              const Icon = capabilityIcons[index];
              return <article key={item.title}><Icon size={25} strokeWidth={1.6} /><div><h4>{item.title}</h4><p>{item.description}</p></div></article>;
            })}
          </div>
        </div>
      </section>

      <section className="journey compact-section" id="journey" aria-label="Journey">
        <div className="section-wrap journey-grid">
          <SectionIndex number="02" title="Journey" caption="A timeline / of growth" />
          <div className="timeline" data-reveal id="journey-heading">
            {journey.map((item) => <article key={item.period}><i /><b>{item.period}</b><h3>{item.title}</h3><p>{item.description}</p></article>)}
          </div>
          <div className="journey-next" data-reveal><ArrowRight size={20} /><p>A better<br />version<br />ahead</p></div>
        </div>
      </section>

      <section className="experience compact-section" id="experience" aria-label="Experience">
        <div className="section-wrap indexed-grid">
          <SectionIndex number="03" title="Experience" caption="Real work / real impact" />
          <div className="experience-cards" id="experience-heading">
            {experience.map((item, index) => <article className="experience-card" key={item.index} data-reveal>
              <div className="card-image"><Image src={experienceImages[index]} fill sizes="(max-width: 820px) 90vw, 27vw" alt="" /><span>{item.index}</span></div>
              <div className="card-copy"><h3>{item.role}</h3><b>{item.period}</b><p>{item.description}</p><ArrowRight size={17} /></div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="work compact-section" id="work" aria-label="Selected work">
        <div className="section-wrap indexed-grid">
          <SectionIndex number="04" title="Selected Work" caption="Ideas / in action" />
          <div className="work-main">
            <div className="project-grid" id="work-heading">
              {projects.map((project, index) => <article className="project" key={project.index} data-reveal>
                <div className="project-image"><Image src={projectImages[index]} fill sizes="(max-width: 820px) 90vw, 20vw" alt="" /></div>
                <div><h3>{project.title}</h3><ArrowUpRight size={16} /><p>{project.category}<br />{project.year}</p></div>
              </article>)}
            </div>
          </div>
          <a className="outline-button projects-link" href="#work-heading">See All Projects <ArrowRight size={14} /></a>
        </div>
      </section>

      <section className="certificates compact-section" id="certificates" aria-label="Certifications">
        <div className="section-wrap indexed-grid">
          <SectionIndex number="05" title="Certifications" caption="Validation / for progress" />
          <div className="certificate-grid" id="certificates-heading">
            {certifications.map((item, index) => {
              const Icon = certificateIcons[index];
              return <article key={item.name} data-reveal><Icon size={29} strokeWidth={1.5} /><div><h3>{item.name}<br />Certification</h3><p>{item.year}</p></div></article>;
            })}
          </div>
        </div>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-heading">
        <Image className="contact-art" src="/og.png" fill sizes="70vw" alt="" />
        <div className="section-wrap contact-grid">
          <SectionIndex number="06" title="Let's Connect" caption="Open to opportunities / and collaborations" />
          <div className="contact-copy" data-reveal>
            <h3 id="contact-heading">Let&apos;s Build Something Meaningful.</h3>
            <p>I&apos;m always open to new opportunities, collaborations,<br />and meaningful conversations.</p>
            <a className="light-button" href={socials[1].href}>Get In Touch <ArrowRight size={14} /></a>
            <div className="socials">
              <a href={socials[0].href} aria-label="LinkedIn"><Link2 size={18} /></a>
              <a href={socials[1].href} aria-label="Email"><Mail size={18} /></a>
              <a href={socials[2].href} aria-label="GitHub"><Code2 size={18} /></a>
            </div>
          </div>
          <p className="contact-note">Same<br />curiosity<br />a brighter<br />horizon</p>
        </div>
      </section>

      <footer><div className="section-wrap footer-grid"><a href="#top">ANH</a><p>© {new Date().getFullYear()} Akbar Nur. All rights reserved.</p><p>Built with purpose.</p><a href="#top" aria-label="Back to top"><ArrowUp size={17} /></a></div></footer>
    </main>
  );
}
