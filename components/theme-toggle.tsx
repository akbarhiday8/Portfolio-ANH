'use client';

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
      <span className="theme-option theme-option-light">Terang</span>
      <span className="theme-option theme-option-dark">Gelap</span>
    </button>
  );
}
