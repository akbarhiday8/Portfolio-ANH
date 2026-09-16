'use client';

import { useEffect } from 'react';

export function MotionController() {
  useEffect(() => {
    const masthead = document.querySelector<HTMLElement>('.masthead-shell');
    const updateMasthead = () => masthead?.classList.toggle('is-scrolled', window.scrollY > 18);
    updateMasthead();
    window.addEventListener('scroll', updateMasthead, { passive: true });

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(max-width: 850px)').matches
    ) {
      return () => window.removeEventListener('scroll', updateMasthead);
    }
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateMasthead);
    };
  }, []);

  useEffect(() => {
    if (window.location.pathname !== '/') return;

    let retryTimer = 0;
    let frame = 0;
    let attempts = 0;

    const scrollToCurrentHash = () => {
      window.clearTimeout(retryTimer);
      cancelAnimationFrame(frame);

      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;

      const target = document.getElementById(id);
      if (!target && attempts < 20) {
        attempts += 1;
        retryTimer = window.setTimeout(scrollToCurrentHash, 100);
        return;
      }
      if (!target) return;

      attempts = 0;
      frame = requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'auto' }));
    };

    scrollToCurrentHash();
    window.addEventListener('hashchange', scrollToCurrentHash);
    window.addEventListener('pageshow', scrollToCurrentHash);
    return () => {
      window.clearTimeout(retryTimer);
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', scrollToCurrentHash);
      window.removeEventListener('pageshow', scrollToCurrentHash);
    };
  }, []);

  return null;
}
