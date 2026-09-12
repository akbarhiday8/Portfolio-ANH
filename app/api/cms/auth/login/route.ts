import { NextResponse } from 'next/server';
import { clearCmsAuthFailures, cmsAuthAttemptKey, cmsSessionCookie, getCmsAuthRetryAfter, loginCmsAdmin, recordCmsAuthFailure } from '@/lib/cms-auth';
import { mutationOriginIsValid } from '@/lib/cms-api';

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = body?.email?.trim() ?? '';
  const attemptKey = await cmsAuthAttemptKey(request, email);
  const retryAfter = await getCmsAuthRetryAfter(attemptKey);
  if (retryAfter) return NextResponse.json(
    { error: `Terlalu banyak percobaan. Coba kembali dalam ${Math.ceil(retryAfter / 60)} menit.` },
    { status: 429, headers: { 'Retry-After': String(retryAfter), 'Cache-Control': 'no-store' } },
  );
  const session = await loginCmsAdmin(email, body?.password ?? '');
  if (!session) {
    await recordCmsAuthFailure(attemptKey);
    return NextResponse.json({ error: 'Email atau kata sandi tidak sesuai.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  await clearCmsAuthFailures(attemptKey);
  const response = NextResponse.json({ ok: true });
  response.headers.set('Cache-Control', 'no-store');
  response.cookies.set(cmsSessionCookie(session.token, session.expiresAt));
  return response;
}
