import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export type CmsAdmin = {
  id: string;
  email: string;
  displayName: string;
};

export class CmsAdminAccessError extends Error {
  constructor() {
    super('CMS_ADMIN_ACCESS_REQUIRED');
    this.name = 'CmsAdminAccessError';
  }
}

function claimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Otorisasi tunggal untuk seluruh CMS. Identitas divalidasi dengan getClaims(),
 * lalu hak admin diverifikasi oleh RPC dalam konteks sesi pengguna tersebut.
 */
export async function requireCmsAdmin(
  requestClient?: SupabaseClient,
): Promise<CmsAdmin> {
  const supabase = requestClient ?? await createSupabaseServerClient();

  try {
    const { data: claimData, error: claimError } = await supabase.auth.getClaims();
    const userId = claimString(claimData?.claims?.sub);
    if (claimError || !userId) throw new CmsAdminAccessError();

    const { data: isAdmin, error: adminError } = await supabase.rpc('cms_is_admin');
    if (adminError || isAdmin !== true) throw new CmsAdminAccessError();

    const { data: adminProfile, error: profileError } = await supabase
      .from('cms_admin_users')
      .select('display_name')
      .eq('user_id', userId)
      .maybeSingle();
    if (profileError || !adminProfile) throw new CmsAdminAccessError();

    const email = claimString(claimData?.claims?.email);
    const displayName = claimString(adminProfile.display_name);
    if (!email || !displayName) throw new CmsAdminAccessError();

    return { id: userId, email, displayName };
  } catch (error) {
    if (error instanceof CmsAdminAccessError) throw error;
    throw new CmsAdminAccessError();
  }
}

export async function getCurrentCmsAdmin(): Promise<CmsAdmin | null> {
  try {
    return await requireCmsAdmin();
  } catch {
    return null;
  }
}
