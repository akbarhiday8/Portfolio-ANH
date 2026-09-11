import { redirect } from 'next/navigation';
import { CmsDashboard } from '@/components/cms/cms-dashboard';
import { getCurrentCmsAdmin, hasCmsAdmin } from '@/lib/cms-auth';
import { getCmsSnapshot } from '@/lib/cms-server';

export default async function CmsPage() {
  if (!await hasCmsAdmin()) redirect('/cms/register');
  const admin = await getCurrentCmsAdmin();
  if (!admin) redirect('/cms/login');
  const initialCollections = await getCmsSnapshot();
  return <CmsDashboard admin={admin} initialCollections={initialCollections} />;
}
