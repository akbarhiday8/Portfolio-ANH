'use client';

import { useEffect } from 'react';

export function MotionController() {
  useEffect(() => {
    const masthead = document.querySelector<HTMLElement>('.masthead-shell');
    const updateMasthead = () => masthead?.classList.toggle('is-scrolled', window.scrollY > 18);
    updateMasthead();
    window.addEventListener('scroll', updateMasthead, { passive: true });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
  return null;
}
