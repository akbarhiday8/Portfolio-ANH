import { LegalPage, legalMetadata } from '@/components/legal-page';
import { getPortfolioContent } from '@/lib/cms-repository';
import { resolveLegalContent } from '@/lib/legal-content';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const { siteContent } = await getPortfolioContent();
  const content = resolveLegalContent(siteContent, 'privacy');
  return legalMetadata(content.title, content.description, '/privasi');
}

export default function PrivacyPage() {
  return <LegalPage page="privacy" />;
}
