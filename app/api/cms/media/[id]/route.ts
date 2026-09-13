import { NextResponse } from 'next/server';
import { invalidOriginResponse, mutationOriginIsValid, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';
import { processPendingMediaDeletions } from '@/lib/cms/media';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type RouteProps = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: RouteProps) {
  if (!mutationOriginIsValid(request)) return invalidOriginResponse();
  if (!await requireCmsApiAdmin()) return unauthorizedResponse();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('cms_queue_media_deletion_admin', {
    media_id_value: id,
  });
  if (error?.code === 'P0002') {
    return NextResponse.json({ error: 'Media tidak ditemukan.' }, { status: 404 });
  }
  if (error?.code === '23503') {
    return NextResponse.json({ error: 'Media masih digunakan oleh konten. Ganti media pada konten tersebut terlebih dahulu.' }, { status: 409 });
  }
  if (error) {
    console.error('[supabase-media] queue deletion failed', { code: error.code });
    return NextResponse.json({ error: 'Media tidak dapat dihapus.' }, { status: 503 });
  }
  const cleanup = await processPendingMediaDeletions(supabase);
  if (cleanup.failed) {
    return NextResponse.json({ error: 'Penghapusan media akan dicoba kembali.' }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
