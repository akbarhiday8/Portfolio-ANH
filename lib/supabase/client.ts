import { createBrowserClient } from '@supabase/ssr';

import { getSupabasePublicConfig } from '@/lib/supabase/config';

/**
 * Buat client baru pada browser saat fitur Supabase diaktifkan pada tahap
 * berikutnya. Client ini hanya memakai publishable key, bukan secret key.
 */
export function createSupabaseBrowserClient() {
  const { url, publishableKey } = getSupabasePublicConfig();

  return createBrowserClient(url, publishableKey);
}
