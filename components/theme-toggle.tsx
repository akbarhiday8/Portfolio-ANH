'use client';

import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const toggleTheme = () => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem('anh-theme', next);
  };

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label="Ganti tema warna"
      title="Ganti tema warna"
    >
      <span className="theme-option theme-option-light"><Sun size={15} aria-hidden="true" /><span>Terang</span></span>
      <span className="theme-option theme-option-dark"><Moon size={15} aria-hidden="true" /><span>Gelap</span></span>
    </button>
  );
}
