import { redirect } from 'next/navigation';
import { CmsDashboard } from '@/components/cms/cms-dashboard';
import { getCurrentCmsAdmin, hasCmsAdmin } from '@/lib/cms-auth';
import { getCmsSnapshot } from '@/lib/cms-server';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!await hasCmsAdmin()) redirect('/admin/register');
  const admin = await getCurrentCmsAdmin();
  if (!admin) redirect('/admin/login');
  return <CmsDashboard admin={admin} initialCollections={await getCmsSnapshot()} />;
}
