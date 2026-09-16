import type { MetadataRoute } from 'next';
import { certificationSlug } from '@/lib/certification-routes';
import { getPortfolioContent } from '@/lib/cms-repository';
import { SITE_URL } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, articles, certifications } = await getPortfolioContent();
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/artikel`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/privasi`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ...projects.map((project) => ({ url: `${SITE_URL}/portfolio/${project.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...articles.map((article) => ({ url: `${SITE_URL}/artikel/${article.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...certifications.map((certification) => ({ url: `${SITE_URL}/sertifikasi/${certificationSlug(certification.name)}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
