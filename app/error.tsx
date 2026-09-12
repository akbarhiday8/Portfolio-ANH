'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="system-page">
      <div className="system-page-card">
        <span>Terjadi kendala</span>
        <h1>Halaman belum dapat ditampilkan.</h1>
        <p>Coba muat kembali. Jika kendala berlanjut, kembali ke beranda dan ulangi beberapa saat lagi.</p>
        <button type="button" onClick={reset}>Coba lagi</button>
      </div>
    </main>
  );
}

