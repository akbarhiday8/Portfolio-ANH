export const CMS_COLLECTIONS = [
  'siteContent',
  'profile',
  'statistics',
  'capabilities',
  'education',
  'experience',
  'projects',
  'certifications',
  'articles',
  'socials',
] as const;

export type CmsCollection = (typeof CMS_COLLECTIONS)[number];
export type CmsStatus = 'draft' | 'published';

export type CmsRecord = {
  id: string;
  collection: CmsCollection;
  slug: string | null;
  sortOrder: number;
  status: CmsStatus;
  data: Record<string, unknown>;
  version?: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CmsRevision = {
  id: string;
  recordId: string;
  collection: CmsCollection;
  status: CmsStatus;
  data: Record<string, unknown>;
  slug?: string | null;
  sortOrder?: number;
  version?: number;
  publishedAt?: string | null;
  createdAt: string;
};
