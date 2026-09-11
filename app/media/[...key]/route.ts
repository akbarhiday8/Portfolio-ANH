import { getMediaBucket } from '@/lib/cms-server';

type RouteProps = { params: Promise<{ key: string[] }> };

export async function GET(request: Request, { params }: RouteProps) {
  const { key } = await params;
  const object = await getMediaBucket().get(key.join('/'));
  if (!object) return new Response('Media tidak ditemukan.', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', object.httpMetadata?.cacheControl ?? 'public, max-age=86400');
  if (request.headers.get('if-none-match') === object.httpEtag) return new Response(null, { status: 304, headers });
  return new Response(object.body as ReadableStream, { headers });
}
