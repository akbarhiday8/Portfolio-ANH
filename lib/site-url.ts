const fallbackSiteUrl = 'http://localhost:3000';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).replace(/\/$/, '');
