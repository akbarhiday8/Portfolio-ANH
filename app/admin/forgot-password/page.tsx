import Link from 'next/link';
import { redirect } from 'next/navigation';

import { BrandIdentity } from '@/components/brand-identity';
import { CmsForgotPasswordForm } from '@/components/cms/forgot-password-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { getCurrentCmsAdmin } from '@/lib/cms-auth';
import { getPortfolioContent } from '@/lib/cms-repository';

export const dynamic = 'force-dynamic';

export default async function AdminForgotPasswordPage() {
  if (await getCurrentCmsAdmin()) redirect('/admin');
  let brandSource: { siteContent: Record<string, unknown>; profile: Record<string, unknown> } = { siteContent: {}, profile: {} };
  try {
    const { siteContent, profile } = await getPortfolioContent();
    brandSource = { siteContent, profile };
  } catch {
    // Pemulihan akun harus tetap tersedia ketika konten public sedang bermasalah.
  }

  return (
    <main className="cms-auth-page">
      <header className="cms-auth-header"><Link href="/" className="cms-auth-brand" aria-label="Kembali ke portfolio"><BrandIdentity context="login" profile={brandSource.profile} siteContent={brandSource.siteContent} /></Link><ThemeToggle /></header>
      <section className="cms-auth-panel">
        <div className="cms-auth-intro"><span>Pemulihan akses</span><h1>Kembali mengelola<br />dengan <em>aman.</em></h1><p>Kirim tautan pemulihan ke email admin. Tidak ada akun baru yang dibuat melalui proses ini.</p></div>
        <div className="cms-auth-card"><p className="cms-auth-kicker">Lupa password</p><h2>Pulihkan akses CMS.</h2><p>Masukkan email akun admin untuk menerima tautan reset password.</p><CmsForgotPasswordForm /></div>
      </section>
      <p className="cms-auth-footnote">Panel privat · Akbar Nur Hidayanto</p>
    </main>
  );
}
