import 'server-only';

import { parseCmsDataBackend, type CmsDataBackend } from '@/lib/cms/backend-value';
export { CmsBackendConfigurationError, type CmsDataBackend } from '@/lib/cms/backend-value';

/** Unset intentionally means D1 until the production cutover is approved. */
export function resolveCmsDataBackend(value = process.env.CMS_DATA_BACKEND): CmsDataBackend {
  return parseCmsDataBackend(value);
}
