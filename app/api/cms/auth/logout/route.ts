import { NextResponse } from 'next/server';
import { CMS_SESSION_COOKIE, deleteCmsSession, getCmsTokenFromRequest } from '@/lib/cms-auth';
import { mutationOriginIsValid } from '@/lib/cms-api';

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 403 });
  await deleteCmsSession(getCmsTokenFromRequest(request));
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ name: CMS_SESSION_COOKIE, value: '', httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
  return response;
}
