'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function MotionController() {
  const pathname = usePathname();
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
    if (pathname !== '/') return;

    let retryTimer = 0;
    let alignmentTimer = 0;
    let frame = 0;
    let attempts = 0;
    let alignmentStarted = 0;

    const stopAlignment = () => window.clearInterval(alignmentTimer);

    const scrollToCurrentHash = () => {
      window.clearTimeout(retryTimer);
      stopAlignment();
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
      const align = () => {
        if (!target.isConnected) return stopAlignment();
        const desiredTop = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        if (Math.abs(target.getBoundingClientRect().top - desiredTop) > 8) {
          target.scrollIntoView({ block: 'start', behavior: 'instant' });
        }
        if (performance.now() - alignmentStarted > 5000) stopAlignment();
      };
      alignmentStarted = performance.now();
      frame = requestAnimationFrame(() => {
        align();
        alignmentTimer = window.setInterval(align, 120);
      });
    };

    scrollToCurrentHash();
    window.addEventListener('hashchange', scrollToCurrentHash);
    window.addEventListener('pageshow', scrollToCurrentHash);
    window.addEventListener('wheel', stopAlignment, { passive: true });
    window.addEventListener('touchstart', stopAlignment, { passive: true });
    window.addEventListener('pointerdown', stopAlignment);
    window.addEventListener('keydown', stopAlignment);
    return () => {
      window.clearTimeout(retryTimer);
      stopAlignment();
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', scrollToCurrentHash);
      window.removeEventListener('pageshow', scrollToCurrentHash);
      window.removeEventListener('wheel', stopAlignment);
      window.removeEventListener('touchstart', stopAlignment);
      window.removeEventListener('pointerdown', stopAlignment);
      window.removeEventListener('keydown', stopAlignment);
    };
  }, [pathname]);

  return null;
}
