import { NextResponse } from 'next/server';

import {
  clearCmsAuthFailures,
  cmsAuthAttemptKey,
  getCmsAuthRetryAfter,
  recordCmsAuthFailure,
  requireCmsAdmin,
} from '@/lib/cms-auth';
import { mutationOriginIsValid } from '@/lib/cms-api';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const genericLoginError = () => NextResponse.json(
  { error: 'Email, kata sandi, atau akses admin tidak sesuai.' },
  { status: 401, headers: { 'Cache-Control': 'private, no-store' } },
);

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) {
    return NextResponse.json(
      { error: 'Permintaan tidak valid.' },
      { status: 403, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  const body = await request.json().catch(() => null) as {
    email?: string;
    password?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase() ?? '';
  const password = body?.password ?? '';
  const attemptKey = await cmsAuthAttemptKey(request, email);
  const retryAfter = await getCmsAuthRetryAfter(attemptKey);

  if (retryAfter) {
    return NextResponse.json(
      { error: `Terlalu banyak percobaan. Coba kembali dalam ${Math.ceil(retryAfter / 60)} menit.` },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'Cache-Control': 'private, no-store',
        },
      },
    );
  }

  if (!email || !password) {
    await recordCmsAuthFailure(attemptKey);
    return genericLoginError();
  }

  const supabase = await createSupabaseServerClient();
  let signInError = false;
  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    signInError = Boolean(result.error);
  } catch {
    signInError = true;
  }

  if (signInError) {
    await recordCmsAuthFailure(attemptKey);
    return genericLoginError();
  }

  try {
    await requireCmsAdmin(supabase);
  } catch {
    await supabase.auth.signOut().catch(() => undefined);
    await recordCmsAuthFailure(attemptKey);
    return genericLoginError();
  }

  await clearCmsAuthFailures(attemptKey);
  return NextResponse.json(
    { ok: true },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
