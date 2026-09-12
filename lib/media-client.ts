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

export async function uploadPreparedMedia(prepared: PreparedMedia, options: { temporary?: boolean } = {}): Promise<MediaItem> {
  const form = new FormData();
  form.set('file', prepared.file);
  form.set('originalSize', String(prepared.originalSize));
  form.set('optimized', prepared.optimized ? '1' : '0');
  form.set('temporary', options.temporary === false ? '0' : '1');
  if (prepared.width) form.set('width', String(prepared.width));
  if (prepared.height) form.set('height', String(prepared.height));
  const response = await fetch('/api/cms/media', { method: 'POST', body: form });
  const result = await response.json().catch(() => ({})) as { error?: string; media?: MediaItem };
  if (!response.ok || !result.media) throw new Error(result.error ?? 'Media tidak dapat diunggah.');
  return result.media;
}

export async function discardTemporaryMedia(item?: MediaItem) {
  if (!item) return;
  await fetch(`/api/cms/media/${item.id}`, { method: 'DELETE', keepalive: true }).catch(() => undefined);
}
