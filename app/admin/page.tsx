import { redirect } from 'next/navigation';
import { CmsDashboard } from '@/components/cms/cms-dashboard';
import { requireCmsAdmin } from '@/lib/cms-auth';
import { getCmsSnapshot } from '@/lib/cms-repository';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const admin = await requireCmsAdmin().catch(() => null);
  if (!admin) redirect('/admin/login');
  return <CmsDashboard admin={admin} initialCollections={await getCmsSnapshot()} />;
}
