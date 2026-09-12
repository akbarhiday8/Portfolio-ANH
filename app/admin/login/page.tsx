import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CmsAuthForm } from '@/components/cms/auth-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { getCurrentCmsAdmin, hasCmsAdmin } from '@/lib/cms-auth';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (!await hasCmsAdmin()) redirect('/admin/register');
  if (await getCurrentCmsAdmin()) redirect('/admin');
  return (
    <main className="cms-auth-page">
      <header className="cms-auth-header"><Link href="/" className="cms-auth-brand" aria-label="Kembali ke portfolio"><strong>ANH</strong><span>Content Management</span></Link><ThemeToggle /></header>
      <section className="cms-auth-panel">
        <div className="cms-auth-intro"><span>Area pengelola</span><h1>Kelola portfolio<br />dengan <em>tenang.</em></h1><p>Masuk untuk memperbarui proyek, pengalaman, sertifikasi, artikel, dan seluruh informasi yang tampil di website.</p></div>
        <div className="cms-auth-card"><p className="cms-auth-kicker">Akses admin</p><h2>Selamat datang kembali.</h2><p>Gunakan akun admin tunggal yang telah terdaftar.</p><CmsAuthForm mode="login" redirectPath="/admin" /></div>
      </section>
      <p className="cms-auth-footnote">Panel privat · Akbar Nur Hidayanto</p>
    </main>
  );
}
