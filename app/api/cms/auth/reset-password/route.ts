import { NextResponse } from 'next/server';

import { requireCmsAdmin } from '@/lib/cms-auth';
import { mutationOriginIsValid } from '@/lib/cms-api';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const noStoreHeaders = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 403, headers: noStoreHeaders });
  }

  const body = await request.json().catch(() => null) as {
    password?: string;
    passwordConfirmation?: string;
  } | null;
  const password = body?.password ?? '';
  const passwordConfirmation = body?.passwordConfirmation ?? '';
  if (!password || !passwordConfirmation) {
    return NextResponse.json({ error: 'Password baru dan konfirmasi wajib diisi.' }, { status: 400, headers: noStoreHeaders });
  }
  if (password !== passwordConfirmation) {
    return NextResponse.json({ error: 'Password baru dan konfirmasi tidak sama.' }, { status: 400, headers: noStoreHeaders });
  }

  const supabase = await createSupabaseServerClient();
  try {
    await requireCmsAdmin(supabase);
  } catch {
    return NextResponse.json(
      { error: 'Sesi pemulihan tidak tersedia atau telah berakhir.' },
      { status: 401, headers: noStoreHeaders },
    );
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    return NextResponse.json(
      { error: 'Password belum dapat diperbarui. Pastikan mengikuti kebijakan keamanan akun.' },
      { status: 422, headers: noStoreHeaders },
    );
  }

  const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
  if (signOutError) {
    return NextResponse.json(
      { error: 'Password diperbarui, tetapi sesi belum dapat diakhiri. Coba kembali.' },
      { status: 500, headers: noStoreHeaders },
    );
  }

  return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
}
