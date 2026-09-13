import 'server-only';

import { parseCmsDataBackend, type CmsDataBackend } from '@/lib/cms/backend-value';
export { CmsBackendConfigurationError, type CmsDataBackend } from '@/lib/cms/backend-value';

declare const __CMS_DATA_BACKEND__: string | undefined;

function runtimeCmsDataBackend() {
  // Vinext replaces this identifier in Worker bundles from `.env.local` or the
  // command environment. Native Node/Next.js has no replacement and uses its
  // regular runtime environment instead.
  if (typeof __CMS_DATA_BACKEND__ === 'string') return __CMS_DATA_BACKEND__;
  return process.env.CMS_DATA_BACKEND;
}

/** Unset intentionally means D1 until the production cutover is approved. */
export function resolveCmsDataBackend(value = runtimeCmsDataBackend()): CmsDataBackend {
  return parseCmsDataBackend(value);
}
