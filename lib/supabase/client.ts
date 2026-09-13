import { createBrowserClient } from '@supabase/ssr';

import { getSupabasePublicConfig } from '@/lib/supabase/config';

/** Client browser hanya memakai publishable key dan tetap tunduk pada RLS. */
export function createSupabaseBrowserClient() {
  const { url, publishableKey } = getSupabasePublicConfig();

  return createBrowserClient(url, publishableKey);
}
