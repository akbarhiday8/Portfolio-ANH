import Link from 'next/link';

import { BrandIdentity } from '@/components/brand-identity';
import { CmsResetPasswordForm } from '@/components/cms/reset-password-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { getPortfolioContent } from '@/lib/cms-repository';

export const dynamic = 'force-dynamic';

export default async function AdminResetPasswordPage() {
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
        <div className="cms-auth-intro"><span>Keamanan akun</span><h1>Tentukan password<br />yang <em>baru.</em></h1><p>Tautan pemulihan diperiksa sebelum perubahan diterapkan. Setelah selesai, Anda harus masuk kembali ke CMS.</p></div>
        <div className="cms-auth-card"><p className="cms-auth-kicker">Reset password</p><h2>Perbarui kredensial.</h2><p>Masukkan password baru dan konfirmasikan sekali lagi.</p><CmsResetPasswordForm /></div>
      </section>
      <p className="cms-auth-footnote">Panel privat · Akbar Nur Hidayanto</p>
    </main>
  );
}
