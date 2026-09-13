import type { MetadataRoute } from 'next';
import { getPortfolioContent } from '@/lib/cms-repository';
import { SITE_URL } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, articles } = await getPortfolioContent();
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/artikel`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...projects.map((project) => ({ url: `${SITE_URL}/portfolio/${project.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...articles.map((article) => ({ url: `${SITE_URL}/artikel/${article.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
