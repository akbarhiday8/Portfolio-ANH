import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="system-page">
      <div className="system-page-card">
        <span>404 / Halaman tidak ditemukan</span>
        <h1>Halaman yang Anda cari tidak tersedia.</h1>
        <p>Alamat mungkin berubah, konten belum dipublikasikan, atau halaman telah dipindahkan.</p>
        <Link href="/">Kembali ke beranda</Link>
      </div>
    </main>
  );
}

