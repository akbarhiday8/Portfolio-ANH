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
      <Moon className="theme-icon theme-icon-light" size={16} aria-hidden="true" />
      <Sun className="theme-icon theme-icon-dark" size={16} aria-hidden="true" />
    </button>
  );
}
