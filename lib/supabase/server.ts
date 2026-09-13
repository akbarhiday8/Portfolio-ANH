import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { getSupabasePublicConfig } from '@/lib/supabase/config';

/**
 * Buat satu client per request pada server. Server Components tidak selalu
 * dapat menulis cookie; pembaruan sesi di sana ditangani secara best effort
 * sampai proxy native Next.js dipasang setelah runtime Vinext dimigrasikan.
 */
export async function createSupabaseServerClient() {
  const { url, publishableKey } = getSupabasePublicConfig();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components are read-only for cookies. Route Handlers can
          // persist refreshed cookies; a native Next.js proxy will own this
          // responsibility in the later runtime migration stage.
        }
      },
    },
  });
}
