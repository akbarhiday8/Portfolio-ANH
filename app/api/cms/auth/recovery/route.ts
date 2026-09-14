import { NextResponse } from 'next/server';

import { requireCmsAdmin } from '@/lib/cms-auth';
import { mutationOriginIsValid } from '@/lib/cms-api';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const noStoreHeaders = { 'Cache-Control': 'private, no-store' };
const invalidRecovery = () => NextResponse.json(
  { error: 'Tautan pemulihan tidak valid atau telah kedaluwarsa.' },
  { status: 401, headers: noStoreHeaders },
);

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 403, headers: noStoreHeaders });
  }

  const body = await request.json().catch(() => null) as { code?: string } | null;
  const code = body?.code?.trim() ?? '';
  if (!code || code.length > 2048) return invalidRecovery();

  const supabase = await createSupabaseServerClient();
  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return invalidRecovery();
    await requireCmsAdmin(supabase);
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch {
    await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
    return invalidRecovery();
  }
}
