import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CmsAuthForm } from '@/components/cms/auth-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { getCurrentCmsAdmin, hasCmsAdmin } from '@/lib/cms-auth';

export const dynamic = 'force-dynamic';

export default async function AdminRegisterPage() {
  const currentAdmin = await getCurrentCmsAdmin();
  if (currentAdmin) redirect('/admin');
  if (await hasCmsAdmin()) redirect('/admin/login');
  return (
    <main className="cms-auth-page">
      <header className="cms-auth-header"><Link href="/" className="cms-auth-brand" aria-label="Kembali ke portfolio"><strong>ANH</strong><span>Content Management</span></Link><ThemeToggle /></header>
      <section className="cms-auth-panel">
        <div className="cms-auth-intro"><span>Penyiapan pertama</span><h1>Satu akun.<br /><em>Satu kendali.</em></h1><p>Buat akun pengelola utama. Setelah selesai, registrasi akan ditutup permanen dan hanya halaman login yang tersedia.</p></div>
        <div className="cms-auth-card"><p className="cms-auth-kicker">Registrasi admin</p><h2>Buat akses pengelola.</h2><p>Akun ini menjadi satu-satunya akun yang dapat mengubah isi website.</p><CmsAuthForm mode="register" redirectPath="/admin" /><small>Gunakan kata sandi yang unik dan tidak dipakai pada layanan lain.</small></div>
      </section>
      <p className="cms-auth-footnote">Konfigurasi aman · Registrasi satu kali</p>
    </main>
  );
}
