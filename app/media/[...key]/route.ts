import { getMediaBucket } from '@/lib/cms-server';

type RouteProps = { params: Promise<{ key: string[] }> };

export async function GET(request: Request, { params }: RouteProps) {
  const { key } = await params;
  const objectKey = key.join('/');
  const object = await getMediaBucket().get(objectKey);
  if (!object) return new Response('Media tidak ditemukan.', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', object.httpMetadata?.cacheControl ?? 'public, max-age=86400');
  headers.set('x-content-type-options', 'nosniff');
  if (!object.httpMetadata?.contentType?.startsWith('image/')) {
    const filename = (object.customMetadata?.originalName ?? objectKey.split('/').pop() ?? 'dokumen').replace(/["\r\n]/g, '');
    headers.set('content-disposition', `inline; filename*=UTF-8''${encodeURIComponent(filename)}`);
  }
  if (request.headers.get('if-none-match') === object.httpEtag) return new Response(null, { status: 304, headers });
  return new Response(object.body as ReadableStream, { headers });
}
