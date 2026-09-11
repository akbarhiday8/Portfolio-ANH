import { NextResponse } from 'next/server';
import { cmsSessionCookie, registerCmsAdmin } from '@/lib/cms-auth';
import { mutationOriginIsValid } from '@/lib/cms-api';

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 403 });
  const body = await request.json().catch(() => null) as { displayName?: string; email?: string; password?: string } | null;
  const displayName = body?.displayName?.trim() ?? '';
  const email = body?.email?.trim().toLowerCase() ?? '';
  const password = body?.password ?? '';
  if (displayName.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 10) {
    return NextResponse.json({ error: 'Lengkapi nama, email valid, dan kata sandi minimal 10 karakter.' }, { status: 400 });
  }
  try {
    const session = await registerCmsAdmin({ displayName, email, password });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(cmsSessionCookie(session.token, session.expiresAt));
    return response;
  } catch (error) {
    const closed = error instanceof Error && error.message === 'REGISTER_CLOSED';
    if (!closed) {
      console.error('[cms-register] Registration failed', {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'Unknown registration failure',
      });
    }
    return NextResponse.json(
      { error: closed ? 'Akun admin sudah tersedia. Silakan masuk.' : 'Akun admin tidak dapat dibuat.' },
      { status: closed ? 409 : 500 },
    );
  }
}
