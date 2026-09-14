import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BrandIdentity } from '@/components/brand-identity';
import { CmsAuthForm } from '@/components/cms/auth-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { getCurrentCmsAdmin } from '@/lib/cms-auth';
import { getPortfolioContent } from '@/lib/cms-repository';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string | string[] }>;
}) {
  if (await getCurrentCmsAdmin()) redirect('/admin');
  const query = await searchParams;
  let brandSource: { siteContent: Record<string, unknown>; profile: Record<string, unknown> } = {
    siteContent: {},
    profile: {},
  };
  try {
    const { siteContent, profile } = await getPortfolioContent();
    brandSource = { siteContent, profile };
  } catch {
    // Authentication must remain available if public CMS content is temporarily unavailable.
  }
  return (
    <main className="cms-auth-page">
      <header className="cms-auth-header"><Link href="/" className="cms-auth-brand" aria-label="Kembali ke portfolio"><BrandIdentity context="login" profile={brandSource.profile} siteContent={brandSource.siteContent} /></Link><ThemeToggle /></header>
      <section className="cms-auth-panel">
        <div className="cms-auth-intro"><span>Area pengelola</span><h1>Kelola portfolio<br />dengan <em>tenang.</em></h1><p>Masuk untuk memperbarui proyek, pengalaman, sertifikasi, artikel, dan seluruh informasi yang tampil di website.</p></div>
        <div className="cms-auth-card"><p className="cms-auth-kicker">Akses admin</p><h2>Selamat datang kembali.</h2><p>Gunakan akun admin Supabase yang telah diizinkan.</p><CmsAuthForm resetSucceeded={query.reset === 'success'} /></div>
      </section>
      <p className="cms-auth-footnote">Panel privat · Akbar Nur Hidayanto</p>
    </main>
  );
}
