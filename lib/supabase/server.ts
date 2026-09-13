import 'server-only';

import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';

import { getSupabasePublicConfig } from '@/lib/supabase/config';

/**
 * Buat satu client per request pada server. Adapter cookie akan dipasangkan
 * bersama migrasi Supabase Auth; belum ada sesi atau autentikasi yang diubah
 * pada Stage 2 ini.
 */
export function createSupabaseServerClient(cookies: CookieMethodsServer) {
  const { url, publishableKey } = getSupabasePublicConfig();

  return createServerClient(url, publishableKey, { cookies });
}
