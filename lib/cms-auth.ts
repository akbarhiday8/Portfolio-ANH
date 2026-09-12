import 'server-only';

import { cookies } from 'next/headers';
import { ensureCmsSchema, getCmsDatabase } from '@/lib/cms-server';

export const CMS_SESSION_COOKIE = 'anh_cms_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
// workerd rejects a single PBKDF2 operation above 100,000 iterations.
// Keep this at the runtime maximum so registration and login behave identically
// in local development and on the deployed Cloudflare Worker.
const PBKDF2_ITERATIONS = 100_000;
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 5;
const encoder = new TextEncoder();

export type CmsAdmin = { id: number; email: string; displayName: string };

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
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

async function hashPassword(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt.slice().buffer, iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

function timingSafeEqual(first: string, second: string) {
  if (first.length !== second.length) return false;
  let difference = 0;
  for (let index = 0; index < first.length; index += 1) {
    difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }
  return difference === 0;
}

export async function hasCmsAdmin() {
  await ensureCmsSchema();
  const row = await getCmsDatabase().prepare('SELECT id FROM cms_admins WHERE id = 1').first();
  return Boolean(row);
}

export async function registerCmsAdmin(input: { email: string; displayName: string; password: string }) {
  await ensureCmsSchema();
  if (await hasCmsAdmin()) throw new Error('REGISTER_CLOSED');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await hashPassword(input.password, salt);
  const now = new Date().toISOString();
  try {
    await getCmsDatabase().prepare(
      `INSERT INTO cms_admins (id, email, display_name, password_hash, password_salt, created_at, updated_at)
       VALUES (1, ?, ?, ?, ?, ?, ?)`,
    ).bind(input.email.toLowerCase(), input.displayName, passwordHash, bytesToHex(salt), now, now).run();
  } catch {
    throw new Error('REGISTER_CLOSED');
  }
  return createCmsSession();
}

export async function loginCmsAdmin(email: string, password: string) {
  await ensureCmsSchema();
  const row = await getCmsDatabase().prepare(
    'SELECT email, password_hash, password_salt FROM cms_admins WHERE id = 1 AND email = ?',
  ).bind(email.toLowerCase()).first<{ email: string; password_hash: string; password_salt: string }>();
  if (!row) return null;
  const candidate = await hashPassword(password, hexToBytes(row.password_salt));
  if (!timingSafeEqual(candidate, row.password_hash)) return null;
  return createCmsSession();
}

async function createCmsSession() {
  await ensureCmsSchema();
  const token = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
  const db = getCmsDatabase();
  await db.batch([
    db.prepare('DELETE FROM cms_sessions WHERE expires_at <= ?').bind(now.toISOString()),
    db.prepare('INSERT INTO cms_sessions (token_hash, admin_id, expires_at, created_at) VALUES (?, 1, ?, ?)')
      .bind(tokenHash, expiresAt.toISOString(), now.toISOString()),
  ]);
  return { token, expiresAt };
}

export async function getCmsAdminFromToken(token?: string | null): Promise<CmsAdmin | null> {
  if (!token) return null;
  await ensureCmsSchema();
  const tokenHash = await sha256(token);
  const row = await getCmsDatabase().prepare(
    `SELECT a.id, a.email, a.display_name
     FROM cms_sessions s JOIN cms_admins a ON a.id = s.admin_id
     WHERE s.token_hash = ? AND s.expires_at > ?`,
  ).bind(tokenHash, new Date().toISOString()).first<{ id: number; email: string; display_name: string }>();
  return row ? { id: row.id, email: row.email, displayName: row.display_name } : null;
}

export async function getCurrentCmsAdmin() {
  const cookieStore = await cookies();
  return getCmsAdminFromToken(cookieStore.get(CMS_SESSION_COOKIE)?.value);
}

export function getCmsTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${CMS_SESSION_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function deleteCmsSession(token?: string | null) {
  if (!token) return;
  await ensureCmsSchema();
  await getCmsDatabase().prepare('DELETE FROM cms_sessions WHERE token_hash = ?').bind(await sha256(token)).run();
}

export async function resetCmsAdminAccount() {
  await ensureCmsSchema();
  const db = getCmsDatabase();
  await db.batch([
    db.prepare('DELETE FROM cms_sessions'),
    db.prepare('DELETE FROM cms_auth_attempts'),
    db.prepare('DELETE FROM cms_admins WHERE id = 1'),
  ]);
}

export const cmsSessionCookie = (token: string, expiresAt: Date) => ({
  name: CMS_SESSION_COOKIE,
  value: token,
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  expires: expiresAt,
});
