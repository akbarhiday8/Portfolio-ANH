import {
  MAX_DOCUMENT_SIZE,
  MAX_SOURCE_IMAGE_SIZE,
  type MediaItem,
} from '@/lib/media-policy';

type ImagePreset = 'content' | 'icon';

export type PreparedMedia = {
  file: File;
  originalSize: number;
  width?: number;
  height?: number;
  optimized: boolean;
  message: string;
};

const ZIP_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
]);
const LEGACY_OFFICE_TYPES = new Set([
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
]);

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function signatureMatches(contentType: string, bytes: Uint8Array) {
  if (contentType === 'image/jpeg') return startsWith(bytes, [0xff, 0xd8, 0xff]);
  if (contentType === 'image/png') return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (contentType === 'image/webp') {
    return startsWith(bytes, [0x52, 0x49, 0x46, 0x46])
      && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  }
  if (contentType === 'application/pdf') {
    return String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-';
  }
  if (ZIP_TYPES.has(contentType)) {
    return startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])
      || startsWith(bytes, [0x50, 0x4b, 0x05, 0x06]);
  }
  if (LEGACY_OFFICE_TYPES.has(contentType)) {
    return startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  }
  if (contentType === 'text/plain' || contentType === 'text/csv') {
    return !bytes.slice(0, 512).includes(0);
  }
  return false;
}

async function sha256Hex(file: File) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()));
  return [...digest].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function jsonResponse<T>(response: Response) {
  const payload = await response.json().catch(() => null) as (T & { error?: string }) | null;
  if (!response.ok || !payload) throw new Error(payload?.error ?? 'Permintaan media gagal.');
  return payload;
}

function extensionlessName(name: string) {
  const dot = name.lastIndexOf('.');
  return (dot > 0 ? name.slice(0, dot) : name).replace(/[\\/:*?"<>|]+/g, '-').trim() || 'media';
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function prepareMediaFile(file: File, preset: ImagePreset = 'content'): Promise<PreparedMedia> {
  if (!file.type.startsWith('image/')) {
    if (file.size > MAX_DOCUMENT_SIZE) throw new Error('Dokumen maksimal 24 MB. Ringkas isi atau ekspor ulang ke PDF teroptimasi.');
    return {
      file,
      originalSize: file.size,
      optimized: false,
      message: 'Dokumen diperiksa dan disimpan dalam format asli agar isi serta tata letaknya tetap utuh.',
    };
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Gunakan gambar JPG, PNG, atau WebP. GIF dan SVG tidak diterima demi keamanan dan performa.');
  }
  if (file.size > MAX_SOURCE_IMAGE_SIZE) throw new Error('Ukuran foto sumber maksimal 24 MB.');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('Gambar tidak dapat dibaca. Coba ekspor ulang sebagai JPG, PNG, atau WebP.');
  }

  const maxEdge = preset === 'icon' ? 640 : 2560;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) {
    bitmap.close();
    throw new Error('Browser tidak dapat menyiapkan optimasi gambar.');
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const quality = preset === 'icon' ? 0.86 : 0.82;
  const blob = await canvasToBlob(canvas, 'image/webp', quality);
  if (!blob) throw new Error('Gambar tidak dapat dikonversi ke WebP.');

  const shouldUseOriginal = file.type === 'image/webp' && scale === 1 && file.size <= blob.size;
  const optimizedFile = shouldUseOriginal
    ? file
    : new File([blob], `${extensionlessName(file.name)}.webp`, { type: 'image/webp', lastModified: Date.now() });
  const saving = Math.max(0, Math.round((1 - optimizedFile.size / file.size) * 100));

  return {
    file: optimizedFile,
    originalSize: file.size,
    width,
    height,
    optimized: !shouldUseOriginal,
    message: !shouldUseOriginal
      ? `Gambar dioptimalkan menjadi WebP ${width}×${height}${saving ? ` dan diperkecil ${saving}%` : ''}.`
      : `WebP sudah efisien pada ukuran ${width}×${height}; file asli dipertahankan.`,
  };
}

export async function uploadPreparedMedia(prepared: PreparedMedia, options: {
  temporary?: boolean;
  onProgress?: (percentage: number) => void;
  signal?: AbortSignal;
} = {}): Promise<MediaItem> {
  const header = new Uint8Array(await prepared.file.slice(0, 512).arrayBuffer());
  if (!signatureMatches(prepared.file.type, header)) {
    throw new Error('Isi berkas tidak sesuai dengan formatnya. Ekspor ulang berkas lalu coba lagi.');
  }
  const metadata = {
    name: prepared.file.name,
    contentType: prepared.file.type,
    size: prepared.file.size,
    originalSize: prepared.originalSize,
    width: prepared.width,
    height: prepared.height,
    optimized: prepared.optimized,
    checksum: await sha256Hex(prepared.file),
  };
  options.onProgress?.(2);
  const preparedResponse = await fetch('/api/cms/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'prepare', ...metadata }),
    signal: options.signal,
  });
  const preparedPayload = await jsonResponse<{
    media?: MediaItem;
    upload?: { objectKey: string; signedUrl: string };
  }>(preparedResponse);
  if (preparedPayload.media) {
    options.onProgress?.(100);
    return preparedPayload.media;
  }
  if (!preparedPayload.upload) throw new Error('Alamat upload media tidak tersedia.');

  const { objectKey, signedUrl } = preparedPayload.upload;
  try {
    await new Promise<void>((resolve, reject) => {
      const body = new FormData();
      body.append('cacheControl', '31536000');
      body.append('', prepared.file);
      const request = new XMLHttpRequest();
      request.open('PUT', signedUrl);
      request.responseType = 'json';
      request.setRequestHeader('x-upsert', 'false');
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          options.onProgress?.(Math.round(5 + (event.loaded / event.total) * 85));
        }
      };
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) resolve();
        else reject(new Error('Media tidak dapat diunggah ke Supabase Storage.'));
      };
      request.onerror = () => reject(new Error('Koneksi terputus saat mengunggah media.'));
      request.onabort = () => reject(new DOMException('Unggahan dibatalkan.', 'AbortError'));
      options.signal?.addEventListener('abort', () => request.abort(), { once: true });
      request.send(body);
    });

    options.onProgress?.(94);
    const completedResponse = await fetch('/api/cms/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete', objectKey, ...metadata }),
      signal: options.signal,
    });
    const completed = await jsonResponse<{ media?: MediaItem }>(completedResponse);
    if (!completed.media) throw new Error('Metadata media tidak tersedia setelah upload.');
    options.onProgress?.(100);
    return completed.media;
  } catch (error) {
    await fetch('/api/cms/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'abort', objectKey }),
      keepalive: true,
    }).catch(() => undefined);
    throw error;
  }
}

export async function discardTemporaryMedia(item?: MediaItem) {
  if (!item) return;
  await fetch(`/api/cms/media/${item.id}`, { method: 'DELETE', keepalive: true }).catch(() => undefined);
}
