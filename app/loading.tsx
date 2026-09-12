export default function Loading() {
  return (
    <main className="system-page" aria-live="polite" aria-busy="true">
      <div className="system-page-card system-page-loading">
        <span>Memuat</span>
        <h1>Menyiapkan halaman.</h1>
        <div aria-hidden="true" />
      </div>
    </main>
  );
}

