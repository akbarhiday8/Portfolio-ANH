import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { ensureCmsSchema, getCmsDatabase } from '@/lib/cms-server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 5;
const encoder = new TextEncoder();

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

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256(value: string) {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
}

export async function cmsAuthAttemptKey(request: Request, email: string) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = request.headers.get('cf-connecting-ip') || forwarded || 'local';
  return sha256(`${ip}|${email.trim().toLowerCase()}`);
}

export async function getCmsAuthRetryAfter(attemptKey: string) {
  await ensureCmsSchema();
  const row = await getCmsDatabase().prepare(
    'SELECT blocked_until, window_started FROM cms_auth_attempts WHERE attempt_key = ?',
  ).bind(attemptKey).first<{ blocked_until: string | null; window_started: string }>();
  if (!row) return 0;
  const now = Date.now();
  const blockedUntil = row.blocked_until ? new Date(row.blocked_until).getTime() : 0;
  if (blockedUntil > now) return Math.max(1, Math.ceil((blockedUntil - now) / 1000));
  if (now - new Date(row.window_started).getTime() > AUTH_WINDOW_MS) {
    await getCmsDatabase().prepare('DELETE FROM cms_auth_attempts WHERE attempt_key = ?').bind(attemptKey).run();
  }
  return 0;
}

export async function recordCmsAuthFailure(attemptKey: string) {
  await ensureCmsSchema();
  const db = getCmsDatabase();
  const row = await db.prepare(
    'SELECT attempts, window_started FROM cms_auth_attempts WHERE attempt_key = ?',
  ).bind(attemptKey).first<{ attempts: number; window_started: string }>();
  const now = new Date();
  const withinWindow = row && now.getTime() - new Date(row.window_started).getTime() <= AUTH_WINDOW_MS;
  const attempts = withinWindow ? Number(row.attempts) + 1 : 1;
  const windowStarted = withinWindow ? row.window_started : now.toISOString();
  const blockedUntil = attempts >= AUTH_MAX_ATTEMPTS ? new Date(now.getTime() + AUTH_WINDOW_MS).toISOString() : null;
  await db.prepare(
    `INSERT INTO cms_auth_attempts (attempt_key, attempts, window_started, blocked_until)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(attempt_key) DO UPDATE SET attempts = excluded.attempts,
       window_started = excluded.window_started, blocked_until = excluded.blocked_until`,
  ).bind(attemptKey, attempts, windowStarted, blockedUntil).run();
}

export async function clearCmsAuthFailures(attemptKey: string) {
  await ensureCmsSchema();
  await getCmsDatabase().prepare('DELETE FROM cms_auth_attempts WHERE attempt_key = ?').bind(attemptKey).run();
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
