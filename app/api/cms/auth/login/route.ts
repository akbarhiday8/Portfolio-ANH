import { NextResponse } from 'next/server';
import { cmsSessionCookie, loginCmsAdmin } from '@/lib/cms-auth';
import { mutationOriginIsValid } from '@/lib/cms-api';

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 403 });
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const session = await loginCmsAdmin(body?.email?.trim() ?? '', body?.password ?? '');
  if (!session) return NextResponse.json({ error: 'Email atau kata sandi tidak sesuai.' }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cmsSessionCookie(session.token, session.expiresAt));
  return response;
}
